// Approximate (tolerant) Arabic search.
//
// Builds a MongoDB filter that matches each search word as a flexible substring,
// tolerant of the most common Arabic spelling variations that break exact search:
//   - alef / hamza forms:      ا أ إ آ  → any of them
//   - yaa / alef maqsura / hamza-on-yaa: ي ى ئ → any
//   - taa marbuta / haa:       ة ه      → any
//   - waw / hamza-on-waw:      و ؤ      → any
// It also matches partial words (no anchors), so typing part of a title finds it.

const VARIANTS = {
  ا: '[اأإآ]', أ: '[اأإآ]', إ: '[اأإآ]', آ: '[اأإآ]',
  ي: '[يىئ]', ى: '[يىئ]', ئ: '[يىئ]',
  ة: '[ةه]', ه: '[ةه]',
  و: '[وؤ]', ؤ: '[وؤ]',
};

const escapeChar = (ch) => (/[.*+?^${}()|[\]\\]/.test(ch) ? `\\${ch}` : ch);

// Turn one word into a tolerant regex source.
const relaxWord = (word) =>
  word
    .split('')
    .map((ch) => VARIANTS[ch] || escapeChar(ch))
    .join('');

/**
 * Build a Mongo filter for an approximate multi-word search across `fields`.
 * Every word must appear (AND) in at least one field (OR). Returns null when empty.
 */
export const buildSearchFilter = (search, fields = ['title', 'appealNumber', 'summary']) => {
  const words = String(search || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return {
    $and: words.map((w) => {
      const rx = new RegExp(relaxWord(w), 'i');
      return { $or: fields.map((f) => ({ [f]: rx })) };
    }),
  };
};
