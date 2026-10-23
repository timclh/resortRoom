// Runs evals/concierge.cases.json against the real model and reports accuracy,
// token use, estimated cost and latency.
//
//   ANTHROPIC_API_KEY=... yarn eval:concierge [--model claude-sonnet-5-5] [--json out.json]
//
// This calls the API, so it costs real money: about 32 requests of a few
// hundred tokens each. On the default model that is a fraction of a cent.
// Exits 1 if the pass rate is below EVAL_MIN_PASS (default 0.9) or any call fails.
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'node:fs';
import { DEFAULT_MODEL, extractFilters } from '../netlify/lib/concierge-core.mjs';

// USD per million tokens (input, output); list prices as of 2026-10-06 for
// prompts under 100K tokens. Check current pricing before relying on the cost.
const PRICES = {
  'claude-haiku-5-5': [0.1, 0.5],
  'claude-sonnet-5-5': [2, 10],
  'claude-opus-5-5': [4, 20]
};

const args = process.argv.slice(2);
const flag = name => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const model = flag('--model') || process.env.CONCIERGE_MODEL || DEFAULT_MODEL;
const minPass = Number(process.env.EVAL_MIN_PASS) || 0.9;
const CONCURRENCY = 4;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Set ANTHROPIC_API_KEY to run the eval. It calls the API and costs real money.');
  process.exit(2);
}

const cases = JSON.parse(readFileSync(new URL('../evals/concierge.cases.json', import.meta.url), 'utf8'));
const client = new Anthropic({ timeout: 30000, maxRetries: 2 });

// Returns the list of fields that differ from what the case expects.
function compare(expect, actual) {
  if (expect.understood === false) {
    return actual.understood === false ? [] : [{ field: 'understood', expected: false, actual: true }];
  }
  if (actual.understood !== true) return [{ field: 'understood', expected: true, actual: false }];
  return Object.entries(expect)
    .filter(([field]) => field !== 'understood')
    .filter(([field, expected]) => actual.filters[field] !== expected)
    .map(([field, expected]) => ({ field, expected, actual: actual.filters[field] }));
}

async function runCase(testCase) {
  const started = Date.now();
  try {
    const result = await extractFilters({ client, query: testCase.query, model });
    return { ...testCase, ms: Date.now() - started, usage: result.usage, diffs: compare(testCase.expect, result), got: result };
  } catch (err) {
    return { ...testCase, ms: Date.now() - started, error: err.code || err.message, diffs: [] };
  }
}

// A small worker pool, so 32 requests do not take 32 round trips in a row.
const results = new Array(cases.length);
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < cases.length) {
      const i = next++;
      results[i] = await runCase(cases[i]);
    }
  })
);

const errored = results.filter(r => r.error);
const failed = results.filter(r => !r.error && r.diffs.length > 0);
const passed = results.length - errored.length - failed.length;

console.log(`Model: ${model}\n`);
for (const r of results) {
  if (r.error) console.log(`ERROR ${r.id}: ${r.error}`);
  else if (r.diffs.length) {
    const detail = r.diffs.map(d => `${d.field}: expected ${JSON.stringify(d.expected)}, got ${JSON.stringify(d.actual)}`).join('; ');
    console.log(`FAIL  ${r.id} [${r.category}] "${r.query}"\n        ${detail}`);
  }
}

console.log(`\nPassed ${passed}/${results.length} (${((passed / results.length) * 100).toFixed(0)}%)`);
const categories = [...new Set(results.map(r => r.category))];
for (const category of categories) {
  const group = results.filter(r => r.category === category);
  const ok = group.filter(r => !r.error && r.diffs.length === 0).length;
  console.log(`  ${category.padEnd(13)} ${ok}/${group.length}`);
}

const input = results.reduce((sum, r) => sum + (r.usage ? r.usage.input_tokens : 0), 0);
const output = results.reduce((sum, r) => sum + (r.usage ? r.usage.output_tokens : 0), 0);
const answered = results.filter(r => r.usage).length || 1;
console.log(`\nTokens: ${input} in, ${output} out (avg ${Math.round(input / answered)} in, ${Math.round(output / answered)} out per request)`);
if (PRICES[model]) {
  const cost = (input * PRICES[model][0] + output * PRICES[model][1]) / 1e6;
  console.log(`Estimated cost: $${cost.toFixed(4)} total, $${((cost / answered) * 1000).toFixed(2)} per 1,000 requests`);
} else {
  console.log(`No price on file for ${model}; add it to PRICES to see a cost.`);
}
const times = results.map(r => r.ms).sort((a, b) => a - b);
console.log(`Latency: p50 ${times[Math.floor(times.length * 0.5)]} ms, p95 ${times[Math.min(times.length - 1, Math.floor(times.length * 0.95))]} ms`);

const jsonPath = flag('--json');
if (jsonPath) writeFileSync(jsonPath, JSON.stringify({ model, passed, total: results.length, results }, null, 2));

const rate = passed / results.length;
if (errored.length || rate < minPass) {
  console.error(`\nBelow the bar: pass rate ${(rate * 100).toFixed(0)}% (need ${(minPass * 100).toFixed(0)}%), ${errored.length} errored.`);
  process.exit(1);
}
