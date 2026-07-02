import Admin from '../models/Admin.js';
import { asyncHandler } from '../middleware/error.js';
import { generateToken } from '../utils/token.js';

// @desc Login admin
// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
  }
  if (!admin.isActive) {
    return res.status(403).json({ success: false, message: 'تم تعطيل هذا الحساب' });
  }
  admin.lastLogin = new Date();
  await admin.save();

  res.json({
    success: true,
    token: generateToken(admin._id),
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

// @desc Get current admin profile
// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// @desc Change password
// @route PUT /api/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' });
  }
  const admin = await Admin.findById(req.admin._id).select('+password');
  if (!(await admin.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
  }
  admin.password = newPassword;
  await admin.save();
  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

// @desc Create new admin (superadmin only)
// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await Admin.findOne({ email: email?.toLowerCase() });
  if (exists) return res.status(400).json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' });
  const admin = await Admin.create({ name, email, password, role: role || 'admin' });
  res.status(201).json({
    success: true,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});
