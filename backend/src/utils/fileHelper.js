import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.join(__dirname, '../../uploads');

// Build a public relative path from a multer file
export const filePublicPath = (file) => {
  if (!file) return '';
  // path relative to uploads dir, normalized to forward slashes
  const rel = path.relative(uploadRoot, file.path).split(path.sep).join('/');
  return `/uploads/${rel}`;
};

// Delete a stored file given its public path (/uploads/...)
export const deleteFile = (publicPath) => {
  if (!publicPath) return;
  try {
    const rel = publicPath.replace(/^\/uploads\//, '');
    const full = path.join(uploadRoot, rel);
    if (full.startsWith(uploadRoot) && fs.existsSync(full)) fs.unlinkSync(full);
  } catch (e) {
    // ignore cleanup errors
  }
};
