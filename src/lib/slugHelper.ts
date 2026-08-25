/**
 * Universal Slug & URL normalization helper for Hindi / Devanagari Unicode
 * and social media share links (WhatsApp, Facebook, Twitter, Telegram).
 */

export function safeDecodeURIComponent(str: string | undefined | null): string {
  if (!str) return '';
  let result = String(str).trim();
  
  // Strip query parameters and hash fragments if present in the slug string
  result = result.split('?')[0].split('#')[0].replace(/\/+$/, '');

  // Safely decode single or double percent-encoded strings
  try {
    result = decodeURIComponent(result);
  } catch {}
  
  try {
    if (result.includes('%')) {
      result = decodeURIComponent(result);
    }
  } catch {}

  return result.trim();
}

export function normalizeText(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces/joiners
    .trim()
    .toLowerCase();
}

export function cleanArticleSlug(slugOrId: string | undefined | null): string {
  if (!slugOrId) return '';
  let cleaned = safeDecodeURIComponent(slugOrId);
  // Remove leading article/ prefix if passed accidentally
  cleaned = cleaned.replace(/^\/?(article\/)?/i, '').replace(/\/+$/, '').trim();
  return cleaned;
}

export function articleMatchesKey(article: any, searchKey: string | undefined | null): boolean {
  if (!article || !searchKey) return false;

  const rawKey = String(searchKey).trim();
  const cleanedKey = cleanArticleSlug(searchKey);
  const normalizedKey = normalizeText(cleanedKey);

  const artId = String(article.id || '').trim();
  const artSlug = String(article.slug || '').trim();
  const artTitle = String(article.title || '').trim();

  // 1. Direct equality
  if (artId === rawKey || artSlug === rawKey || artId === cleanedKey || artSlug === cleanedKey) {
    return true;
  }

  // 2. Normalized equality
  const normId = normalizeText(artId);
  const normSlug = normalizeText(artSlug);

  if (normId === normalizedKey || normSlug === normalizedKey) {
    return true;
  }

  // 3. Match against encoded forms
  try {
    const encKey = encodeURIComponent(cleanedKey);
    if (normSlug === normalizeText(encKey) || normId === normalizeText(encKey)) {
      return true;
    }
  } catch {}

  // 4. Fallback slug generated from title (if slug was updated or created dynamically)
  if (artTitle) {
    const titleSlug = artTitle
      .toLowerCase()
      .replace(/[^\u0900-\u097F\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    if (normalizeText(titleSlug) === normalizedKey) {
      return true;
    }
  }

  return false;
}
