import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-7xl font-extrabold text-primary-700">404</h1>
      <p className="mt-4 text-xl font-bold text-slate-800">الصفحة غير موجودة</p>
      <p className="mt-2 text-slate-500">عذراً، الصفحة التي تبحث عنها غير متاحة.</p>
      <Link to="/" className="btn-primary mt-6 px-6 py-2.5">
        العودة للرئيسية
      </Link>
    </div>
  );
}
