import fs from 'fs';
import path from 'path';
import { uploadRoot } from '../config/paths.js';

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
    const full = path.resolve(uploadRoot, rel);
    // Guard against path traversal: the resolved path must stay inside uploadRoot
    if ((full === uploadRoot || full.startsWith(uploadRoot + path.sep)) && fs.existsSync(full)) {
      fs.unlinkSync(full);
    }
  } catch (e) {
    // ignore cleanup errors
  }
};
