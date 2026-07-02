import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.join(__dirname, '../../uploads');

// Ensure subfolders exist
const ensureDir = (dir) => {
  const full = path.join(uploadRoot, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  return full;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // images vs pdfs split by mimetype, subfolder per resource via req.uploadFolder
    const base = file.mimetype === 'application/pdf' ? 'pdfs' : 'images';
    const folder = req.uploadFolder ? `${base}/${req.uploadFolder}` : base;
    cb(null, ensureDir(folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = file.fieldname.replace(/[^a-z0-9]/gi, '');
    cb(null, `${safe}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || imageTypes.includes(file.mimetype)) {
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
