export const BAD_WORDS = ['fuck','shit','bitch'];

export function containsBadWords(text = ''){
  try {
    const s = String(text || '');
    return BAD_WORDS.some(w => new RegExp(`\\b${w}\\b`, 'i').test(s));
  } catch { return false; }
}
