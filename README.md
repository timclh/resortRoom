# Beach Resort

A hotel-room browsing site built with React. **This is a demo project for a
fictional resort**: the rooms, prices and contact details are placeholders, and
there is no booking or payment.

What it does: browse rooms, filter them by type, guests, price, size, breakfast
and pets, and open a detail page for each room. There is also a contact form.

## Stack

- React 18, React Router 6, Create React App (react-scripts 5)
- Room data lives in `src/data.js`, shaped like Contentful entries, and is shared
  through a context provider (`src/context.js`)
- Hosted on Netlify; the contact form uses Netlify Forms

## Requirements

Node 22.12 or newer; `.nvmrc` pins 22. Netlify reads `.nvmrc` too, and it takes
precedence over a `NODE_VERSION` set in the site settings. Some dependencies
(`sharp`, Testing Library 16, `@netlify/blobs`) refuse to install on older Node,
which fails the deploy at the install step.

## Scripts

| Command | What it does |
| --- | --- |
| `yarn start` | Dev server on http://localhost:3000 |
| `yarn test` | Tests (React Testing Library) |
| `yarn build` | Production build, then `scripts/postbuild.js` |
| `yarn analyze` | Bundle breakdown (run after `yarn build`) |
| `yarn optimize-images` | Re-encode `src/images/*.jpeg` to WebP in `src/images/optimized/` |

## AI concierge

On the rooms page, a guest can type what they want ("family of four with a dog,
under $400", in any language) and the page sets the same filters they could set
by hand. The model does not pick rooms or write text; it only fills in a form.

```
rooms page ──POST──> Netlify Function ──> Claude (structured output)
   ^                  netlify/functions/concierge.mjs         │
   └── sets filters ── validated and clamped ◄────────────────┘
```

- **Closed output.** The reply is a JSON object (room type, guests, max price,
  minimum size, breakfast, pets, and whether the message was about choosing a
  room at all). There is no free-text field, so the endpoint is no use as a
  general chatbot, and nothing the model writes is ever shown or run. The text
  summary on the page is built from the filters.
- **Nothing is trusted.** `normalize()` enforces types and ranges on the server
  (structured outputs cannot express numeric limits), and the page checks the
  shape again before applying anything. The guest's message is passed as data,
  with the instructions kept separate.
- **No catalogue in the prompt.** The model only needs the rules (room types,
  price and size ranges), about 400 tokens, so a request is cheap. A test checks
  those limits against `src/data.js`.
- **Fails soft.** If the service is off, out of budget, slow or returns
  something unusable, the page says so and the filters below keep working.

**Cost controls.** Per request: 300-character input cap, 2 KB body cap,
`max_tokens` 1024, low effort, an 8 s timeout, no retries. Per instance: repeated
questions are answered from a one-hour cache. Overall: a hard cap of 300 model
calls per UTC day across all visitors (`CONCIERGE_DAILY_LIMIT`, counted in
Netlify Blobs), and a kill switch (`CONCIERGE_ENABLED=false`, no redeploy).
Also set a monthly spend limit in the Anthropic Console; that is outside this repo.

The default model is `claude-haiku-5-5` (override with `CONCIERGE_MODEL`). My
estimate from the prompt size is roughly $0.08 to $0.24 per 1,000 requests on
Haiku 5.5 depending on how much it thinks, against about $2 to $5 on Sonnet 5.5
(list prices, 2026-10-06). `yarn eval:concierge` prints the measured numbers.

**Setup.** Add `ANTHROPIC_API_KEY` under Site configuration, Environment
variables, in Netlify. Without it the endpoint answers 503 and the page falls
back to the filters. To run it locally: copy `.env.example` to `.env`, then
`npx netlify-cli dev`.

**Eval.** `evals/concierge.cases.json` has 32 requests (basic, multilingual,
edge cases, and prompt-injection or off-topic attempts) with the expected
filters. `yarn eval:concierge` runs them against the live model and reports the
pass rate per category, tokens, estimated cost and latency; it exits non-zero
below 90% (`EVAL_MIN_PASS`). It costs real money, a fraction of a cent on the
default model. Offline tests check that the cases themselves are valid.

**Not verified yet.** The unit tests use a fake model client, and the function
bundles and loads, but:
- no request has been made to the live API, so the eval pass rate is unknown;
- the Netlify side (the function route next to the SPA rewrite, Blobs, whether
  the declared per-visitor `rateLimit` is enforced on this plan) is untested;
- the structured-output request is hand-written to the documented
  `{type: "json_schema", schema}` form, not yet accepted by the API.

Run the eval once with a key and try the deploy preview before relying on it.

## Notes

**Images.** Sources in `src/images/*.jpeg` are re-encoded by
`scripts/optimize-images.js` at their original aspect ratio, capped at 1280px
wide: 1747 KB of JPEG becomes 906 KB of WebP. Run the script again after adding
or replacing a source image; it also regenerates `public/og-image.jpg`.

**Deploy.** `netlify.toml` caches `/static/*` for a year (the build content-hashes
those files) and adds basic security headers. `scripts/postbuild.js` fills in the
site address from Netlify's `URL` variable (Open Graph tags, structured data) and
writes `sitemap.xml`. A local build has no `URL`, so it skips the sitemap.

**Contact form.** It posts to Netlify Forms, so it only works once deployed on
Netlify. Locally the request fails and the form says so. The matching static form
in `public/index.html` is what makes Netlify register it; keep the two in sync.

**Known limits.** The site is client-rendered, so every page shares the same
Open Graph tags and crawlers that don't run JavaScript see an empty shell.
