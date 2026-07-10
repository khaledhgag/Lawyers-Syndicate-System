import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { uploadRoot, backupRoot } from '../config/paths.js';

// Only files matching this exact pattern are ever created / served / deleted.
const BACKUP_NAME_RE = /^uploads-backup-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.zip$/;

// In-memory progress of the currently running backup (single job at a time).
let progress = {
  running: false,
  percent: 0,
  processedFiles: 0,
  totalFiles: 0,
  filename: null,
  startedAt: null,
};

export const getProgress = () => ({ ...progress });

// Resolve a client-supplied filename to a safe absolute path inside backupRoot.
// Returns null for anything that isn't a valid backup filename (blocks traversal).
export const resolveBackup = (filename) => {
  if (typeof filename !== 'string' || !BACKUP_NAME_RE.test(filename)) return null;
  const full = path.resolve(backupRoot, filename);
  if (full !== path.join(backupRoot, filename)) return null;
  if (!(full === backupRoot || full.startsWith(backupRoot + path.sep))) return null;
  return full;
};

// List existing backups, newest first.
export const listBackups = () => {
  if (!fs.existsSync(backupRoot)) return [];
  return fs
    .readdirSync(backupRoot)
    .filter((f) => BACKUP_NAME_RE.test(f))
    .map((f) => {
      const st = fs.statSync(path.join(backupRoot, f));
      return { filename: f, size: st.size, createdAt: st.mtime.toISOString() };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Count files under a directory iteratively (no recursion depth limits, no buffering).
const countFiles = (dir) => {
  let count = 0;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.isDirectory()) stack.push(path.join(d, e.name));
      else count++;
    }
  }
  return count;
};

/**
 * Stream the entire uploadRoot into a ZIP inside backupRoot.
 * Fully streaming (archiver pipes to a write stream) — no file is ever loaded
 * into memory, so it scales to 20GB+ and 100k+ files.
 */
export const createBackup = () =>
  new Promise((resolve, reject) => {
    if (progress.running) {
      return reject(Object.assign(new Error('توجد نسخة احتياطية قيد التنفيذ بالفعل'), { statusCode: 409 }));
    }

    if (!fs.existsSync(backupRoot)) fs.mkdirSync(backupRoot, { recursive: true });

    const now = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}-${p(now.getHours())}-${p(now.getMinutes())}`;
    const filename = `uploads-backup-${stamp}.zip`;
    const outPath = path.join(backupRoot, filename);

    const totalFiles = fs.existsSync(uploadRoot) ? countFiles(uploadRoot) : 0;
    progress = { running: true, percent: 0, processedFiles: 0, totalFiles, filename, startedAt: now.toISOString() };

    const startedMs = Date.now();
    console.log(`🗄️  Backup started: ${filename} — ${totalFiles} file(s) from ${uploadRoot}`);

    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      progress = { ...progress, running: false };
      console.error(`❌ Backup failed: ${filename} — ${err.message}`);
      // best-effort cleanup of the partial archive
      fs.promises.unlink(outPath).catch(() => {});
      reject(err);
    };

    output.on('close', () => {
      if (settled) return;
      settled = true;
      const size = archive.pointer();
      const durationMs = Date.now() - startedMs;
      progress = { ...progress, running: false, percent: 100 };
      console.log(
        `✅ Backup completed: ${filename} — ${(size / 1048576).toFixed(2)} MB, ${progress.processedFiles} files, ${(durationMs / 1000).toFixed(1)}s`
      );
      resolve({ filename, size, createdAt: now.toISOString(), durationMs, files: progress.processedFiles });
    });

    output.on('error', fail);
    archive.on('error', fail);
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') return; // a file vanished mid-backup — skip it
      console.warn(`⚠️  Backup warning: ${err.message}`);
    });
    archive.on('entry', () => {
      progress.processedFiles++;
      if (progress.totalFiles > 0) {
        progress.percent = Math.min(99, Math.round((progress.processedFiles / progress.totalFiles) * 100));
      }
    });

    archive.pipe(output);
    if (fs.existsSync(uploadRoot)) archive.directory(uploadRoot, false);
    archive.finalize().catch(fail);
  });
