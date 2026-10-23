import React, { useContext, useRef, useState } from "react";
import { RoomContext } from "../context";
import Title from "./Title";

const ENDPOINT = "/.netlify/functions/concierge";
const MAX_CHARS = 300;
const TIMEOUT_MS = 12000;

const EXAMPLES = [
  "Family of four with a dog, under $400",
  "Two of us, breakfast included, under $350",
  "带狗的四口之家，预算 400 美元以内"
];

// Shown when the AI search cannot help; the filters below always still work.
const MESSAGES = {
  unavailable: "The AI search is unavailable right now. You can still use the filters below.",
  busy: "The AI search is busy. Please try again in a moment, or use the filters below.",
  daily_limit: "This demo's AI search has reached its daily limit. You can still use the filters below.",
  not_understood:
    "I can only help you choose a room. Try something like “family of four with a dog, under $400”."
};

// A plain-language summary of what was applied, built from the filters rather
// than from model text.
export const describeFilters = ({ type, guests, maxPrice, minSize, breakfast, pets }) => {
  const parts = [];
  if (type !== "all") parts.push(`${type} rooms`);
  if (guests > 1) parts.push(`sleeps ${guests}+`);
  if (maxPrice !== null) parts.push(`up to $${maxPrice} a night`);
  if (minSize) parts.push(`at least ${minSize} sq ft`);
  if (breakfast) parts.push("breakfast included");
  if (pets) parts.push("pets allowed");
  return parts.length ? parts.join(" · ") : "all rooms";
};

const isFilters = f =>
  !!f &&
  typeof f.type === "string" &&
  Number.isFinite(f.guests) &&
  (f.maxPrice === null || Number.isFinite(f.maxPrice)) &&
  (f.minSize === null || Number.isFinite(f.minSize)) &&
  typeof f.breakfast === "boolean" &&
  typeof f.pets === "boolean";

const Concierge = () => {
  const { applyFilters, resetFilters } = useContext(RoomContext);
  const [query, setQuery] = useState("");
  const [state, setState] = useState({ status: "idle" });
  const latest = useRef(0);

  const ask = async text => {
    const question = text.trim();
    if (!question) return;

    const id = ++latest.current;
    const isCurrent = () => id === latest.current;
    const fail = key => isCurrent() && setState({ status: "error", message: MESSAGES[key] });

    setState({ status: "loading" });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
        signal: controller.signal
      });
      // Anything that is not our JSON (an HTML error page, say) ends up here as null.
      const data = await response.json().catch(() => null);
      if (!isCurrent()) return;

      if (!response.ok) return fail(data && MESSAGES[data.error] ? data.error : "unavailable");
      if (!data || typeof data.understood !== "boolean") return fail("unavailable");
      if (!data.understood) return fail("not_understood");
      if (!isFilters(data.filters)) return fail("unavailable");

      applyFilters(data.filters);
      setState({ status: "done", summary: describeFilters(data.filters) });
    } catch (err) {
      fail("unavailable");
    } finally {
      clearTimeout(timer);
    }
  };

  const onSubmit = event => {
    event.preventDefault();
    ask(query);
  };

  const onExample = example => {
    setQuery(example);
    ask(example);
  };

  const onClear = () => {
    latest.current++;
    resetFilters();
    setQuery("");
    setState({ status: "idle" });
  };

  const loading = state.status === "loading";

  return (
    <section className="concierge">
      <Title title="ask the concierge" />
      <form className="concierge-form" onSubmit={onSubmit}>
        <label htmlFor="concierge-query">
          Describe your stay in your own words, in any language.
        </label>
        <div className="concierge-row">
          <input
            id="concierge-query"
            type="text"
            value={query}
            maxLength={MAX_CHARS}
            onChange={event => setQuery(event.target.value)}
            placeholder="e.g. family of four with a dog, under $400"
          />
          <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
            {loading ? "Searching..." : "Find rooms"}
          </button>
        </div>
        <div className="concierge-examples">
          {EXAMPLES.map(example => (
            <button
              key={example}
              type="button"
              className="concierge-example"
              disabled={loading}
              onClick={() => onExample(example)}
            >
              {example}
            </button>
          ))}
        </div>
        <p className="concierge-status" role="status">
          {state.status === "loading" && "Looking for rooms..."}
          {state.status === "done" && (
            <>
              Showing: {state.summary}.{" "}
              <button type="button" className="concierge-clear" onClick={onClear}>
                Clear
              </button>
            </>
          )}
          {state.status === "error" && state.message}
        </p>
        <p className="concierge-note">
          Your message is sent to Claude (Anthropic) to choose the filters below.
        </p>
      </form>
    </section>
  );
};

export default Concierge;
