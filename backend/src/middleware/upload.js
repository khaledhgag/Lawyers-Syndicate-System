import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadRoot } from '../config/paths.js';

// Ensure subfolders exist
const ensureDir = (dir) => {
  const full = path.join(uploadRoot, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  return full;
};

// Allowed types → the ONLY extensions we ever write to disk. The stored
// extension is derived from the validated mimetype, never from the uploaded
// filename, so an executable (.php/.exe/.sh) can never be written or served.
const EXT_BY_MIME = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // images vs pdfs split by mimetype, subfolder per resource via req.uploadFolder
    const base = file.mimetype === 'application/pdf' ? 'pdfs' : 'images';
    const folder = req.uploadFolder ? `${base}/${req.uploadFolder}` : base;
    cb(null, ensureDir(folder));
  },
  filename: (req, file, cb) => {
    // Extension comes from the allowlist, not the client-supplied name.
    const ext = EXT_BY_MIME[file.mimetype] || '';
    const safe = file.fieldname.replace(/[^a-z0-9]/gi, '');
    cb(null, `${safe}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (EXT_BY_MIME[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يُسمح بالصور و PDF فقط'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 26214400 },
});

// helper to set subfolder for a route
export const setUploadFolder = (folder) => (req, res, next) => {
  req.uploadFolder = folder;
  next();
};

export default upload;
