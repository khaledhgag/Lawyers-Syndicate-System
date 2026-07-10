// Async handler wrapper to avoid repetitive try/catch
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 404 handler
export const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `المسار غير موجود - ${req.originalUrl}` });
};

// Central error handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'حدث خطأ في الخادم';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'المعرف غير صالح';
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `القيمة مكررة بالفعل${field ? ` للحقل: ${field}` : ''}`;
  }
  // Mongoose validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' | ');
  }
  // Multer file size
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'حجم الملف أكبر من الحد المسموح';
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = err.field === 'attachments' ? 'الحد الأقصى للمرفقات هو 5 ملفات' : 'عدد الملفات المرفوعة أكبر من المسموح';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('🔴', err);
  }

  res.status(statusCode || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
