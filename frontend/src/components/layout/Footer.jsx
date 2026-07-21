import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { FaFacebookF, FaYoutube, FaWhatsapp, FaInstagram, FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { navItems } from '../../config/nav.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { whatsappHref } from '../../utils/whatsapp.js';

export default function Footer() {
  const { settings } = useSettings();
  const s = settings || {};
  const social = s.social || {};
  const year = new Date().getFullYear();

  const socials = [
    { url: social.facebook, Icon: FaFacebookF },
    { url: social.twitter, Icon: FaXTwitter },
    { url: social.youtube, Icon: FaYoutube },
    { url: social.instagram, Icon: FaInstagram },
    { url: whatsappHref(social.whatsapp) || social.whatsapp, Icon: FaWhatsapp },
    { url: social.telegram, Icon: FaTelegramPlane },
  ].filter((x) => x.url);

  return (
    <footer className="mt-16 bg-primary-900 text-slate-200">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-bold text-white">{s.unionName || 'نقابة محامين جنوب القليوبية'}</h3>
          <p className="text-sm leading-7 text-slate-300 line-clamp-3">
            {s.aboutText || 'الموقع الرسمي لنقابة محامين جنوب القليوبية لخدمة السادة المحامين.'}
          </p>
          {socials.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socials.map(({ url, Icon }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold-500"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-3 text-base font-bold text-white">روابط سريعة</h4>
          <ul className="grid grid-cols-2 gap-y-2 text-sm">
            {navItems.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-slate-300 transition hover:text-gold-400">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-base font-bold text-white">معلومات التواصل</h4>
          <ul className="space-y-3 text-sm text-slate-300">
            {s.address && (
              <li className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 shrink-0 text-gold-400" /> {s.address}
              </li>
            )}
            {s.phone && (
              <li className="flex items-center gap-2">
                <FiPhone className="text-gold-400" /> {s.phone}
              </li>
            )}
            {s.email && (
              <li className="flex items-center gap-2">
                <FiMail className="text-gold-400" /> {s.email}
              </li>
            )}
            {s.workingHours && (
              <li className="flex items-center gap-2">
                <FiClock className="text-gold-400" /> {s.workingHours}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        <p>© {year} {s.unionName || 'نقابة محامين جنوب القليوبية'} - جميع الحقوق محفوظة</p>
        <p className="mt-1" dir="ltr">
          Developed by{' '}
          <a
            href="https://www.instagram.com/khaled_abuelenien/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gold-400 transition hover:text-gold-500 hover:underline"
          >
            K
          </a>
        </p>
      </div>
    </footer>
  );
}
