import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiBriefcase, FiTag, FiBookOpen, FiFileText,
  FiLink, FiActivity, FiInbox, FiSettings, FiLogOut, FiMenu, FiX, FiExternalLink, FiMapPin,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/admin', label: 'الإحصائيات', Icon: FiGrid, end: true },
  { to: '/admin/board-members', label: 'مجلس النقابة', Icon: FiUsers },
  { to: '/admin/services', label: 'الخدمات', Icon: FiBriefcase },
  { to: '/admin/offers', label: 'العروض الحصرية', Icon: FiTag },
  { to: '/admin/lectures', label: 'الندوات والمحاضرات', Icon: FiBookOpen },
  { to: '/admin/judgments', label: 'أحكام النقض', Icon: FiFileText },
  { to: '/admin/contracts', label: 'التعاقدات', Icon: FiBriefcase },
  { to: '/admin/courts', label: 'المحاكم', Icon: FiMapPin },
  { to: '/admin/government-links', label: 'المواقع الحكومية', Icon: FiLink },
  { to: '/admin/activities', label: 'الأنشطة', Icon: FiActivity },
  { to: '/admin/complaints', label: 'الشكاوى والطلبات', Icon: FiInbox },
  { to: '/admin/settings', label: 'إعدادات الموقع', Icon: FiSettings },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-primary-700 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  const Sidebar = (
    <div className="flex h-full flex-col bg-primary-900">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold-400">⚖</span>
        <span className="text-sm font-bold text-white">لوحة التحكم</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
            <l.Icon className="h-5 w-5 shrink-0" /> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link to="/" target="_blank" className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
          <FiExternalLink className="h-5 w-5" /> عرض الموقع
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/20">
          <FiLogOut className="h-5 w-5" /> تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 hidden w-64 lg:block">{Sidebar}</aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-64">{Sidebar}</aside>
        </div>
      )}

      <div className="lg:mr-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)}>
            {open ? <FiX /> : <FiMenu />}
          </button>
          <div className="mr-auto flex items-center gap-2 text-sm">
            <span className="hidden text-slate-500 sm:inline">مرحباً،</span>
            <span className="font-semibold text-slate-800">{admin?.name}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700">
              {admin?.name?.charAt(0)}
            </span>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
