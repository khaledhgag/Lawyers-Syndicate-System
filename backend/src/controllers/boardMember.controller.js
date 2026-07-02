import BoardMember from '../models/BoardMember.js';
import { asyncHandler } from '../middleware/error.js';
import { filePublicPath, deleteFile } from '../utils/fileHelper.js';

export const getAll = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  const members = await BoardMember.find(filter).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, count: members.length, data: members });
});

export const getOne = asyncHandler(async (req, res) => {
  const member = await BoardMember.findById(req.params.id);
  if (!member) return res.status(404).json({ success: false, message: 'العضو غير موجود' });
  res.json({ success: true, data: member });
});

export const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (req.file) body.photo = filePublicPath(req.file);
  const member = await BoardMember.create(body);
  res.status(201).json({ success: true, data: member });
});

export const update = asyncHandler(async (req, res) => {
  const member = await BoardMember.findById(req.params.id);
  if (!member) return res.status(404).json({ success: false, message: 'العضو غير موجود' });
  const body = { ...req.body };
  if (req.file) {
    deleteFile(member.photo);
    body.photo = filePublicPath(req.file);
  }
  Object.assign(member, body);
  await member.save();
  res.json({ success: true, data: member });
});

export const remove = asyncHandler(async (req, res) => {
  const member = await BoardMember.findById(req.params.id);
  if (!member) return res.status(404).json({ success: false, message: 'العضو غير موجود' });
  deleteFile(member.photo);
  await member.deleteOne();
  res.json({ success: true, message: 'تم الحذف بنجاح' });
});
