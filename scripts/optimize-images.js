// Re-encodes the source JPEGs in src/images as WebP, keeping each image's
// native aspect ratio and never upscaling. Also renders the social preview
// image (public/og-image.jpg). Run with: npm run optimize-images
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../src/images');
const OUT = path.join(SRC, 'optimized');
const OG_OUT = path.join(__dirname, '../public/og-image.jpg');

const MAX_WIDTH = 1280;
const WEBP_QUALITY = 75;

const kb = bytes => `${(bytes / 1024).toFixed(0)} KB`;

async function main() {
  // Start clean so renamed or deleted sources never leave stale outputs behind.
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const sources = fs
    .readdirSync(SRC)
    .filter(file => /\.jpe?g$/i.test(file))
    .sort();

  let before = 0;
  let after = 0;

  for (const file of sources) {
    const name = path.basename(file, path.extname(file));
    const input = path.join(SRC, file);
    const output = path.join(OUT, `${name}.webp`);

    const info = await sharp(input)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(output);

    const original = fs.statSync(input).size;
    before += original;
    after += info.size;
    console.log(
      `${file.padEnd(18)} ${kb(original).padStart(7)} -> ${kb(info.size).padStart(6)}  (${info.width}x${info.height})`
    );
  }

  console.log(`\n${sources.length} images: ${kb(before)} -> ${kb(after)}`);

  // 1200x630 is the size Facebook, LinkedIn, Slack and Twitter expect.
  await sharp(path.join(SRC, 'room-1.jpeg'))
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(OG_OUT);
  console.log(`og-image.jpg      ${kb(fs.statSync(OG_OUT).size)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
