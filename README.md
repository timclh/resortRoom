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

Node 20 or newer; `.nvmrc` pins 22. Netlify reads `.nvmrc` too, and it takes
precedence over a `NODE_VERSION` set in the site settings. Some dev dependencies
(`sharp`, Testing Library 16) refuse to install on older Node, which fails the
deploy at the install step.

## Scripts

| Command | What it does |
| --- | --- |
| `yarn start` | Dev server on http://localhost:3000 |
| `yarn test` | Tests (React Testing Library) |
| `yarn build` | Production build, then `scripts/postbuild.js` |
| `yarn analyze` | Bundle breakdown (run after `yarn build`) |
| `yarn optimize-images` | Re-encode `src/images/*.jpeg` to WebP in `src/images/optimized/` |

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
