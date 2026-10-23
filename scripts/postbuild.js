// Runs after `react-scripts build`. Fills in everything that needs the
// deployed site's address, which is only known at deploy time:
//   - replaces __SITE_URL__ in build/index.html (Open Graph, JSON-LD)
//   - writes build/sitemap.xml and points robots.txt at it
//
// Netlify exposes the primary site address as the URL environment variable.
// Without it (a local build) the sitemap is skipped, because a sitemap listing
// URLs for the wrong host is worse than none.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const SITE_URL = (process.env.URL || '').replace(/\/+$/, '');

const indexPath = path.join(BUILD, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
fs.writeFileSync(indexPath, html.split('__SITE_URL__').join(SITE_URL));

if (!SITE_URL) {
  console.log('postbuild: URL is not set, skipping sitemap.xml (local build).');
  process.exit(0);
}

// Room pages come from the slugs in src/data.js.
const data = fs.readFileSync(path.join(ROOT, 'src/data.js'), 'utf8');
const slugs = [...data.matchAll(/slug:\s*"([^"]+)"/g)].map(match => match[1]);
if (slugs.length === 0) {
  throw new Error('postbuild: found no room slugs in src/data.js');
}

const paths = ['/', '/rooms', ...slugs.map(slug => `/rooms/${slug}`), '/contact'];
const today = new Date().toISOString().slice(0, 10);
const urls = paths
  .map(p => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join('\n');

fs.writeFileSync(
  path.join(BUILD, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

const robotsPath = path.join(BUILD, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8').replace(/\s*$/, '\n');
fs.writeFileSync(robotsPath, `${robots}\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`postbuild: wrote sitemap.xml (${paths.length} URLs) for ${SITE_URL}`);
