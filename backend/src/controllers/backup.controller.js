import fs from 'fs';
import { asyncHandler } from '../middleware/error.js';
import * as backupService from '../services/backup.service.js';

// @desc Create a new backup of the uploads folder
// @route POST /api/admin/backups/create   (superadmin)
export const create = asyncHandler(async (req, res) => {
  try {
    const result = await backupService.createBackup();
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    const code = err.statusCode || 500;
    res.status(code).json({ success: false, message: err.message || 'تعذر إنشاء النسخة الاحتياطية' });
  }
});

// @desc List all backups (newest first)
// @route GET /api/admin/backups   (superadmin)
export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: backupService.listBackups() });
});

// @desc Current backup progress
// @route GET /api/admin/backups/progress   (superadmin)
export const progress = asyncHandler(async (req, res) => {
  res.json({ success: true, ...backupService.getProgress() });
});

// @desc Download a backup (streamed)
// @route GET /api/admin/backups/:filename   (superadmin)
export const download = asyncHandler(async (req, res) => {
  const full = backupService.resolveBackup(req.params.filename);
  if (!full || !fs.existsSync(full)) {
    return res.status(404).json({ success: false, message: 'النسخة الاحتياطية غير موجودة' });
  }
  // res.download streams the file from disk; nothing is buffered in memory.
  res.download(full, req.params.filename);
});

// @desc Delete a backup
// @route DELETE /api/admin/backups/:filename   (superadmin)
export const remove = asyncHandler(async (req, res) => {
  const full = backupService.resolveBackup(req.params.filename);
  if (!full || !fs.existsSync(full)) {
    return res.status(404).json({ success: false, message: 'النسخة الاحتياطية غير موجودة' });
  }
  await fs.promises.unlink(full);
  res.json({ success: true, message: 'تم حذف النسخة الاحتياطية' });
});
