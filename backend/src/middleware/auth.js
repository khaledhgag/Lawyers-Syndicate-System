import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Protect routes - require valid JWT
export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'غير مصرح، الرجاء تسجيل الدخول' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    }
    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'تم تعطيل هذا الحساب' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'الجلسة غير صالحة أو منتهية' });
  }
};

// Restrict to specific roles
export const authorize = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return res.status(403).json({ success: false, message: 'ليس لديك صلاحية للقيام بهذا الإجراء' });
  }
  next();
};
