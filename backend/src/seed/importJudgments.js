/**
 * Bulk-import judgment PDFs from a local folder into the database.
 *
 * Usage (PowerShell):
 *   npm run import:judgments -- --dir "C:\\path\\to\\pdfs" --category جنائي
 *   npm run import:judgments -- --dir "C:\\path\\to\\pdfs" --category مدني --move
 *
 * - Scans the folder (and subfolders) for .pdf files.
 * - Copies each file into backend/uploads/pdfs/judgments/imported/ (use --move to move instead).
 * - Inserts one judgment per file: title = file name, category = chosen, pdf = served path.
 * - Tries to parse appeal number / year from the file name when possible.
 * Designed for tens of thousands of files (batched inserts).
 */
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Judgment from '../models/Judgment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads/pdfs/judgments/imported');

// --- parse CLI args ---
const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : undefined;
};
const dir = getArg('dir');
const move = args.includes('--move');
const BATCH = 1000;

if (!dir) {
  console.error('❌ مطلوب: --dir <المجلد>');
  process.exit(1);
}
if (!fs.existsSync(dir)) {
  console.error(`❌ المجلد غير موجود: ${dir}`);
  process.exit(1);
}

// recursively collect .pdf files
const collect = (d, out = []) => {
  for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else if (entry.name.toLowerCase().endsWith('.pdf')) out.push(full);
  }
  return out;
};

const run = async () => {
  await connectDB();
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const files = collect(dir);
  console.log(`📁 وجدت ${files.length} ملف PDF. الوضع: ${move ? 'نقل' : 'نسخ'}`);
  if (!files.length) return process.exit(0);

  let buffer = [];
  let total = 0;

  const flush = async () => {
    if (!buffer.length) return;
    await Judgment.insertMany(buffer, { ordered: false });
    total += buffer.length;
    console.log(`   ✅ تم إدخال ${total}/${files.length}`);
    buffer = [];
  };

  for (const src of files) {
    const original = path.basename(src);
    const base = original.replace(/\.pdf$/i, '').trim();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    const dest = path.join(uploadDir, unique);
    try {
      if (move) fs.renameSync(src, dest);
      else fs.copyFileSync(src, dest);
    } catch (e) {
      console.warn(`   ⚠️  تعذّر نسخ ${original}: ${e.message}`);
      continue;
    }
    buffer.push({
      title: base || 'حكم بدون عنوان',
      pdf: `/uploads/pdfs/judgments/imported/${unique}`,
    });
    if (buffer.length >= BATCH) await flush();
  }
  await flush();

  console.log(`🎉 اكتمل الاستيراد. إجمالي الأحكام المضافة: ${total}`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((e) => {
  console.error('Import error:', e);
  process.exit(1);
});
