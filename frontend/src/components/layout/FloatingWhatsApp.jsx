import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext.jsx';
import { whatsappHref } from '../../utils/whatsapp.js';

export default function FloatingWhatsApp() {
  const { settings } = useSettings();
  const s = settings || {};

  const message =
    s.whatsappMessage ||
    'السلام عليكم، تواصلت معكم من خلال الموقع الإلكتروني لنقابة محامين جنوب القليوبية 🌐';

  // Prefer the dedicated number field, fall back to the social link
  const href = whatsappHref(s.whatsappNumber || s.social?.whatsapp, message);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="group fixed bottom-5 left-5 z-50 flex items-center gap-2"
    >
      <span className="relative flex h-14 w-14 items-center justify-center">
        {/* Pulsing ring */}
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/60" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-600/40 transition hover:scale-105 hover:bg-green-600">
          <FaWhatsapp className="h-8 w-8" />
        </span>
      </span>
      <span className="pointer-events-none hidden whitespace-nowrap rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 sm:block">
        تواصل معنا على واتساب
      </span>
    </a>
  );
}
