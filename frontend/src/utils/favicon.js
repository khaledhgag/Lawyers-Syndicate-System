// Auto-derive a site's logo/favicon from its URL using Google's favicon service.
export const faviconUrl = (url, size = 64) => {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${host}`;
  } catch {
    return '';
  }
};
