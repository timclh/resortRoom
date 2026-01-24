const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../src/images');
const OUTPUT_DIR = path.join(__dirname, '../src/images/optimized');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all JPEG images
const images = fs.readdirSync(IMAGES_DIR).filter(file =>
  file.endsWith('.jpeg') || file.endsWith('.jpg')
);

console.log(`Found ${images.length} images to optimize...\n`);

async function optimizeImage(filename) {
  const inputPath = path.join(IMAGES_DIR, filename);
  const baseName = path.basename(filename, path.extname(filename));

  try {
    // Create WebP version (smaller, modern format)
    await sharp(inputPath)
      .resize(800, 600, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(OUTPUT_DIR, `${baseName}.webp`));

    // Create optimized JPEG fallback
    await sharp(inputPath)
      .resize(800, 600, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(path.join(OUTPUT_DIR, `${baseName}.jpg`));

    // Create thumbnail for lazy loading placeholder
    await sharp(inputPath)
      .resize(20, 15, { fit: 'cover' })
      .blur(5)
      .webp({ quality: 20 })
      .toFile(path.join(OUTPUT_DIR, `${baseName}-placeholder.webp`));

    const originalSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(path.join(OUTPUT_DIR, `${baseName}.webp`)).size;
    const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

    console.log(`✓ ${filename}: ${(originalSize/1024).toFixed(0)}KB → ${(webpSize/1024).toFixed(0)}KB (${savings}% smaller)`);
  } catch (err) {
    console.error(`✗ ${filename}: ${err.message}`);
  }
}

async function run() {
  console.log('Starting image optimization...\n');

  for (const image of images) {
    await optimizeImage(image);
  }

  console.log('\n✓ Image optimization complete!');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
}

run();
