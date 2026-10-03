const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Recursively find all JPG and PNG files
function getFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      getFiles(fullPath, files);
    } else if (/\.(jpe?g|png)$/i.test(item.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

sharp.cache(false);

async function compressAll() {
  const files = getFiles(IMAGES_DIR);
  console.log(`Found ${files.length} images to inspect.`);

  let totalSaved = 0;
  let processedCount = 0;

  for (const file of files) {
    const stat = fs.statSync(file);
    // Only compress if file size is > 200 KB
    if (stat.size > 200 * 1024) {
      const ext = path.extname(file).toLowerCase();
      try {
        const inputBuffer = fs.readFileSync(file);
        let pipeline = sharp(inputBuffer).rotate();

        const metadata = await sharp(inputBuffer).metadata();
        const maxDimension = file.includes('hero') ? 1920 : 1600;

        if (metadata.width && metadata.width > maxDimension) {
          pipeline = pipeline.resize({ width: maxDimension, withoutEnlargement: true });
        }

        let buffer;
        if (ext === '.png') {
          buffer = await pipeline.png({ quality: 80, compressionLevel: 8 }).toBuffer();
        } else {
          buffer = await pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true }).toBuffer();
        }

        // Only overwrite if we actually made it smaller
        if (buffer.length < stat.size) {
          const savedBytes = stat.size - buffer.length;
          fs.writeFileSync(file, buffer);
          totalSaved += savedBytes;
          processedCount++;
          console.log(`Compressed: ${path.relative(IMAGES_DIR, file)} | ${(stat.size / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB (saved ${(savedBytes / 1024).toFixed(0)}KB)`);
        }
      } catch (err) {
        console.error(`Failed to compress ${file}:`, err.message);
      }
    }
  }

  console.log(`\nDone! Successfully compressed ${processedCount} images.`);
  console.log(`Total data saved: ${(totalSaved / (1024 * 1024)).toFixed(2)} MB!`);
}

compressAll();
