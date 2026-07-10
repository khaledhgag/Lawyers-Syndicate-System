// Normalize any WhatsApp value (plain number, wa.me link, api.whatsapp link)
// into digits-only, then into a proper https://wa.me link.

export const toPhoneDigits = (raw = '') => {
  const str = String(raw).trim();
  if (!str) return '';
  const urlMatch = str.match(/(?:wa\.me\/|phone=)(\+?\d[\d\s-]*)/i);
  const source = urlMatch ? urlMatch[1] : str;
  return source.replace(/\D/g, '');
};

// Build a clickable wa.me href. Returns '' when there is no valid number.
export const whatsappHref = (raw, message) => {
  const phone = toPhoneDigits(raw);
  if (!phone) return '';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${phone}${text}`;
};
