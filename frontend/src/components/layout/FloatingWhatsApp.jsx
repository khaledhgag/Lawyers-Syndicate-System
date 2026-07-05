import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext.jsx';

// Extract a clean international phone number (digits only) from a raw value
// that may be a plain number, a wa.me link, or an api.whatsapp.com link.
const toPhoneDigits = (raw = '') => {
  const str = String(raw).trim();
  if (!str) return '';
  // If it's a wa.me / api.whatsapp.com URL, grab the number part
  const urlMatch = str.match(/(?:wa\.me\/|phone=)(\+?\d[\d\s-]*)/i);
  const source = urlMatch ? urlMatch[1] : str;
  return source.replace(/\D/g, '');
};

export default function FloatingWhatsApp() {
  const { settings } = useSettings();
  const s = settings || {};

  // Prefer the dedicated number field, fall back to the social link
  const phone = toPhoneDigits(s.whatsappNumber || s.social?.whatsapp);
  if (!phone) return null;

  const message =
    s.whatsappMessage ||
    'السلام عليكم، تواصلت معكم من خلال الموقع الإلكتروني لنقابة محامين جنوب القليوبية 🌐';

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

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
