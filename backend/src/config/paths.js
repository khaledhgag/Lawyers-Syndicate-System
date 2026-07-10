import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Single source of truth for the uploads root.
 *
 * Defaults to backend/uploads (unchanged behavior). Set UPLOAD_DIR to an
 * ABSOLUTE path on a persistent disk/volume so uploaded files survive
 * redeploys (a fresh git checkout wipes anything not in the repo).
 */
export const uploadRoot = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../../uploads');

// Make sure the root exists at boot so the first upload never fails.
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

/**
 * Where ZIP backups of the uploads folder are stored. Kept OUTSIDE uploadRoot
 * (a sibling) so backups are never included in their own archive.
 * Defaults to <parent-of-uploadRoot>/backups; override with BACKUP_DIR.
 */
export const backupRoot = process.env.BACKUP_DIR
  ? path.resolve(process.env.BACKUP_DIR)
  : path.join(path.dirname(uploadRoot), 'backups');

if (!fs.existsSync(backupRoot)) fs.mkdirSync(backupRoot, { recursive: true });
