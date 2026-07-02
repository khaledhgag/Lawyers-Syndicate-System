// Resolve a safe Google Maps embed URL from site settings.
// Handles: full embed URL, a pasted <iframe> snippet, or falls back to
// building an embed from the address / maps link so a valid map always loads.
export function resolveMapEmbed({ googleMapsEmbed, googleMapsLink, address } = {}) {
  const val = (googleMapsEmbed || '').trim();

  // 1) Admin pasted the whole <iframe ... src="..."> snippet → extract src
  if (val.includes('<iframe')) {
    const m = val.match(/src=["']([^"']+)["']/i);
    if (m && /^https?:\/\//i.test(m[1])) return m[1];
  }

  // 2) A real embeddable Google Maps URL (must be an embed, not a share/place link)
  if (/^https?:\/\//i.test(val) && (/\/maps\/embed/i.test(val) || /output=embed/i.test(val))) {
    return val;
  }

  // 3) Fallback: build a generic embed from the address (works without API key)
  const query = (address && address.trim()) || extractQuery(googleMapsLink);
  if (query) return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return '';
}

// Pull the place query out of a maps link like https://maps.google.com/?q=Benha
function extractQuery(link) {
  if (!link) return '';
  try {
    const u = new URL(link);
    return u.searchParams.get('q') || '';
  } catch {
    return '';
  }
}
