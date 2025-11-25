const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// Directory where generated PNGs will be stored
const GENERATED_DIR = path.join(process.cwd(), 'generated-images');

function ensureGeneratedDir() {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
}

/**
 * Save a PNG buffer to disk and return a public URL for it.
 * The URL is built from PUBLIC_BASE_URL (if set) or left as a relative path.
 *
 * @param {Buffer} pngBuffer
 * @returns {Promise<string>} public URL to the saved PNG
 */
async function savePngAndGetUrl(pngBuffer) {
  ensureGeneratedDir();

  const filename = `${randomUUID()}.png`;
  const filePath = path.join(GENERATED_DIR, filename);

  await fs.promises.writeFile(filePath, pngBuffer);

  const baseUrl = (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  const relativePath = `/generated-images/${filename}`;

  // If PUBLIC_BASE_URL is set, return absolute URL, otherwise relative
  return baseUrl ? `${baseUrl}${relativePath}` : relativePath;
}

module.exports = { savePngAndGetUrl };


