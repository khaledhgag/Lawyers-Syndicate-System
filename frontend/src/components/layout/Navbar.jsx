import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { FaBalanceScale } from 'react-icons/fa';
import { navItems } from '../../config/nav.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { governmentLinksApi } from '../../api/services.js';
import { fileUrl } from '../../api/axios.js';

export default function Navbar() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [govLinks, setGovLinks] = useState([]);
  const [govOpen, setGovOpen] = useState(false);

  useEffect(() => {
    governmentLinksApi.list().then((r) => setGovLinks(r.data)).catch(() => {});
  }, []);

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-semibold transition ${
      isActive ? 'bg-gold-500 text-white shadow' : 'text-slate-200 hover:bg-white/10 hover:text-gold-400'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a1730]/95 backdrop-blur">
      <div className="container-page flex h-[72px] items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end text-right leading-tight">
            <span className="text-sm font-extrabold text-white sm:text-base">
              {settings?.unionName || 'نقابة محامين جنوب القليوبية'}
            </span>
            <span className="text-[11px] font-semibold tracking-wide text-gold-400">South Qalyubia Bar</span>
          </div>
          {settings?.logo ? (
            <img src={fileUrl(settings.logo)} alt="logo" className="h-11 w-11 rounded-xl object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500 text-xl text-white shadow-lg">
              <FaBalanceScale />
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 2xl:flex">
          {navItems.map((item) =>
            item.dropdown ? (
              <div key={item.to} className="relative" onMouseEnter={() => setGovOpen(true)} onMouseLeave={() => setGovOpen(false)}>
                <NavLink to={item.to} className={linkClass}>
                  <span className="inline-flex items-center gap-1">
                    {item.label} <FiChevronDown className="h-3.5 w-3.5" />
                  </span>
                </NavLink>
                {govOpen && govLinks.length > 0 && (
                  <div className="absolute right-0 top-full w-64 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                    {govLinks.map((g) => (
                      <a
                        key={g._id}
                        href={g.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                      >
                        {g.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <button
          className="rounded-lg p-2 text-white hover:bg-white/10 2xl:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="القائمة"
        >
          {open ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-white/10 bg-[#0a1730] 2xl:hidden">
          <div className="container-page flex flex-col py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-gold-500 text-white' : 'text-slate-200 hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
