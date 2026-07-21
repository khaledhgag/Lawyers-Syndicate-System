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
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

const DOC_MIMES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const MAX_UPLOAD_FILE_SIZE = Math.max(Number(process.env.MAX_FILE_SIZE) || 0, 83886080);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // documents (pdf/word) vs images, subfolder per resource via req.uploadFolder
    const base = VIDEO_MIMES.includes(file.mimetype) ? 'videos' : DOC_MIMES.includes(file.mimetype) ? 'pdfs' : 'images';
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
  const isVideo = VIDEO_MIMES.includes(file.mimetype);

  if (file.fieldname === 'video') {
    return isVideo ? cb(null, true) : cb(new Error('يُسمح برفع فيديو واحد فقط في خانة الفيديو'));
  }

  if (isVideo) {
    return cb(new Error('الفيديو يجب رفعه من خانة الفيديو فقط'));
  }

  if (EXT_BY_MIME[file.mimetype]) return cb(null, true);

  cb(new Error('نوع الملف غير مدعوم. يُسمح بالصور و PDF و Word، وبالفيديو من خانة الفيديو فقط'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_FILE_SIZE },
});

// helper to set subfolder for a route
export const setUploadFolder = (folder) => (req, res, next) => {
  req.uploadFolder = folder;
  next();
};

export default upload;
