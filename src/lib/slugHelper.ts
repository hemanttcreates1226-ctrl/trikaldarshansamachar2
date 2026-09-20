/**
 * Universal Slug & URL normalization helper for Hindi / Devanagari Unicode
 * and social media share links (WhatsApp, Facebook, Twitter, Telegram).
 */

const HINDI_CHAR_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', '्': '',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'd', 'ढ़': 'dh', 'फ़': 'f', 'य़': 'y',
  'ॐ': 'om'
};

const COMMON_HINDI_WORDS: Record<string, string> = {
  'समाचार': 'samachar',
  'खबर': 'khabar',
  'खबरें': 'khabarein',
  'पन्ना': 'panna',
  'उज्जैन': 'ujjain',
  'इंदौर': 'indore',
  'भोपाल': 'bhopal',
  'ग्वालियर': 'gwalior',
  'जबलपुर': 'jabalpur',
  'रीवा': 'rewa',
  'सतना': 'satna',
  'सागर': 'sagar',
  'रतलाम': 'ratlam',
  'देवास': 'dewas',
  'शाजापुर': 'shajapur',
  'नीमच': 'neemuch',
  'मंदसौर': 'mandsaur',
  'खरगोन': 'khargone',
  'खंडवा': 'khandwa',
  'धार': 'dhar',
  'मध्य': 'madhya',
  'प्रदेश': 'pradesh',
  'राजनीति': 'rajneeti',
  'मौसम': 'mausam',
  'और': 'aur',
  'में': 'mein',
  'का': 'ka',
  'की': 'ki',
  'के': 'ke',
  'से': 'se',
  'पर': 'par',
  'को': 'ko',
  'है': 'hai',
  'था': 'tha',
  'थी': 'thi',
  'साइबर': 'cyber',
  'फ्रॉड': 'fraud',
  'क्राइम': 'crime',
  'पुलिस': 'police',
  'महाकाल': 'mahakal',
  'मंदिर': 'mandir',
  'आरती': 'aarti',
  'योजना': 'yojana',
  'किसान': 'kisan',
  'सरकार': 'sarkar',
  'शिक्षा': 'shiksha',
  'बोर्ड': 'board',
  'परीक्षा': 'pariksha',
  'बारिश': 'barish',
  'अलर्ट': 'alert',
  'हादसा': 'hadsa',
  'दुर्घटना': 'durghatna',
  'बजट': 'budget',
  'चुनाव': 'chunav',
  'विकास': 'vikas',
  'प्रशासन': 'prashasan',
  'कलेक्टर': 'collector',
  'एसपी': 'sp',
  'थाना': 'thana',
  'गिरफ्तार': 'arrest',
  'मौत': 'death',
  'घायल': 'injured',
  'अस्पताल': 'hospital',
  'कॉरिडोर': 'corridor',
  'दर्शन': 'darshan',
  'त्रिकाल': 'trikal',
  'नया': 'naya',
  'नई': 'nayi',
  'बड़ा': 'bada',
  'बड़ी': 'badi',
  'विशेष': 'vishesh',
  'राष्ट्रीय': 'national',
  'देश': 'desh',
  'विदेश': 'videsh',
  'लाइव': 'live',
  'ताजा': 'taza',
  'ताज़ा': 'taza',
  'अपडेट': 'update',
  'ब्यूरो': 'bureau'
};

/**
 * Transliterates Hindi/Devanagari text to a clean, readable ASCII slug
 * Example: "राजनीति और मौसम" -> "rajneeti-aur-mausam"
 */
export function transliterateHindiToEnglish(hindiText: string): string {
  if (!hindiText) return '';
  let str = hindiText.trim();

  // Replace common Hindi news words first
  for (const [hindi, eng] of Object.entries(COMMON_HINDI_WORDS)) {
    str = str.replace(new RegExp(hindi, 'g'), ` ${eng} `);
  }

  // Replace character by character
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (HINDI_CHAR_MAP[char] !== undefined) {
      result += HINDI_CHAR_MAP[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char;
    } else if (/\s+/.test(char) || char === '-' || char === '_') {
      result += '-';
    }
  }

  // Clean up dashes and limit length
  return result
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 45);
}

/**
 * Generates a clean, short, human-friendly ASCII slug from article title and ID
 * Ensures URLs never get corrupted by huge %E0%A4%... percent-encoded characters
 */
export function generateCleanSlug(title: string | undefined | null, id?: string): string {
  const shortId = id ? id.replace(/^news-|^art-/, '').slice(-6) : Math.random().toString(36).slice(2, 7);
  if (!title) return `art-${shortId}`;

  const transliterated = transliterateHindiToEnglish(title);
  if (transliterated && transliterated.length >= 2) {
    return `${transliterated}-${shortId}`;
  }

  // Fallback to ASCII letters from title if present
  const asciiTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (asciiTitle && asciiTitle.length >= 2) {
    return `${asciiTitle.substring(0, 35)}-${shortId}`;
  }

  return `art-${shortId}`;
}

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
  // Remove leading post/ or article/ or n/ or a/ or news/ or p/ prefix if passed accidentally
  cleaned = cleaned.replace(/^\/?(post\/|article\/|news\/|share\/|p\/|n\/|a\/)?/i, '').replace(/\/+$/, '').trim();
  return cleaned;
}

export const PUBLIC_CANONICAL_DOMAIN = 'https://trikaldarshansamachar.com';

/**
 * Ensures public URLs for social bots and sharing point to the canonical live domain
 * rather than private local/dev preview hosts (like localhost or ais-dev-*.run.app)
 * which external crawlers (WhatsApp, Facebook, Telegram) cannot access.
 */
export function sanitizePublicOrigin(url?: string): string {
  if (!url) return PUBLIC_CANONICAL_DOMAIN;
  const trimmed = url.replace(/\/+$/, '').trim();
  if (
    trimmed.includes('localhost') ||
    trimmed.includes('127.0.0.1') ||
    trimmed.includes('0.0.0.0') ||
    trimmed.includes('ais-dev-')
  ) {
    return PUBLIC_CANONICAL_DOMAIN;
  }
  return trimmed;
}

/**
 * Returns a clean, short, shareable URL for WhatsApp, Telegram, SMS, etc.
 * Uses ASCII-safe clean slug (e.g., https://trikaldarshansamachar.com/post/post-title)
 * Strictly guarantees no %E0%... percent-encoded characters in the shared URL.
 */
export function getArticleShareUrl(article: { id?: string; slug?: string; title?: string } | undefined | null, baseUrl?: string): string {
  const origin = sanitizePublicOrigin(baseUrl || (typeof window !== 'undefined' ? window.location.origin : undefined));
  if (!article) return origin;

  const id = String(article.id || '').trim();
  const rawSlug = String(article.slug || '').trim();

  // 1. If slug is concise clean ASCII (a-z, 0-9, dash), use it
  if (rawSlug && /^[a-zA-Z0-9_-]+$/.test(rawSlug) && rawSlug.length <= 60 && !rawSlug.includes('%')) {
    return `${origin}/post/${rawSlug}`;
  }

  // 2. If id is clean ASCII (e.g. news-1, art-172589), use it
  if (id && /^[a-zA-Z0-9_-]+$/.test(id) && !id.includes('%') && id.startsWith('news-')) {
    return `${origin}/post/${id}`;
  }

  // 3. Otherwise, generate a clean transliterated ASCII slug
  const clean = generateCleanSlug(article.title, id);
  return `${origin}/post/${clean}`;
}

export function devanagariSkeleton(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .normalize('NFKD')
    .replace(/[\u093e-\u094d\u0951-\u0954\u0962-\u0963\u0901-\u0903\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '')
    .toLowerCase();
}

export function tokenizeText(str: string | undefined | null): string[] {
  if (!str) return [];
  return String(str)
    .toLowerCase()
    .replace(/[^\u0900-\u097Fa-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2);
}

const STOP_WORDS = new Set([
  'news', 'art', 'post', 'samachar', 'darshan', 'trikal', 'the', 'and', 'for', 'of', 'in',
  'to', 'ke', 'ki', 'ka', 'me', 'mein', 'par', 'se', 'hai', 'hain', 'ko', 'aur', 'kya',
  'yeh', 'vah', 'bhi', 'latest', 'breaking', 'live'
]);

export function articleMatchesKey(article: any, searchKey: string | undefined | null, strictMatch = false): boolean {
  if (!article || !searchKey) return false;

  const rawKey = String(searchKey).trim();
  const cleanedKey = cleanArticleSlug(searchKey);
  const normalizedKey = normalizeText(cleanedKey);
  const decodedKey = safeDecodeURIComponent(rawKey);

  const artId = String(article.id || '').trim();
  const artSlug = String(article.slug || '').trim();
  const artTitle = String(article.title || '').trim();

  // 1. Exact equality (raw, cleaned, and decoded)
  if (
    artId === rawKey ||
    artSlug === rawKey ||
    artId === cleanedKey ||
    artSlug === cleanedKey ||
    artId === decodedKey ||
    artSlug === decodedKey
  ) {
    return true;
  }

  // 2. Case-insensitive equality
  const lowerRaw = rawKey.toLowerCase();
  const lowerDecoded = decodedKey.toLowerCase();
  const lowerArtId = artId.toLowerCase();
  const lowerArtSlug = artSlug.toLowerCase();

  if (
    lowerArtId === lowerRaw ||
    lowerArtSlug === lowerRaw ||
    lowerArtId === lowerDecoded ||
    lowerArtSlug === lowerDecoded
  ) {
    return true;
  }

  // 3. Extracted ID matching (e.g. from slug ending in news-178... or art-...)
  const idMatch = rawKey.match(/(news-\d+|art-\d+)/i) || decodedKey.match(/(news-\d+|art-\d+)/i);
  if (idMatch && idMatch[1].toLowerCase() === lowerArtId) {
    return true;
  }

  // 4. Normalized string equality for slugs and IDs
  const normId = normalizeText(artId);
  const normSlug = normalizeText(artSlug);
  const normDecoded = normalizeText(decodedKey);

  if (
    (normId && (normId === normalizedKey || normId === normDecoded)) ||
    (normSlug && (normSlug === normalizedKey || normSlug === normDecoded))
  ) {
    return true;
  }

  // 5. Clean URL path prefix removal (e.g. /post/xyz -> xyz)
  const cleanPathKey = decodedKey
    .replace(/^\/?(post|article|news|share|p|n|a)\//i, '')
    .replace(/\/+$/, '')
    .trim()
    .toLowerCase();
  if (cleanPathKey && (cleanPathKey === lowerArtSlug || cleanPathKey === lowerArtId)) {
    return true;
  }

  // 6. Devanagari skeleton matching (exact skeleton equality or significant full-match)
  const skelKey = devanagariSkeleton(decodedKey) || devanagariSkeleton(cleanedKey);
  if (skelKey && skelKey.length >= 4) {
    const skelSlug = devanagariSkeleton(artSlug);
    const skelTitle = devanagariSkeleton(artTitle);

    if (skelSlug === skelKey || skelTitle === skelKey) return true;
    if (skelSlug && (skelSlug.startsWith(skelKey) || skelKey.startsWith(skelSlug)) && Math.min(skelSlug.length, skelKey.length) >= 6) {
      return true;
    }
  }

  // 7. Transliteration matching (English to Hindi & Hindi to English)
  const transliteratedSlug = artSlug ? transliterateHindiToEnglish(artSlug) : '';
  const transliteratedKey = transliterateHindiToEnglish(decodedKey);

  if (transliteratedKey && transliteratedKey.length >= 5) {
    if (transliteratedSlug && (transliteratedSlug === transliteratedKey || transliteratedSlug.startsWith(transliteratedKey))) {
      return true;
    }
  }

  // If strict match requested (e.g. for image lookup or precise post routing),
  // NEVER use loose token overlap to avoid cross-post contamination.
  if (strictMatch) {
    return false;
  }

  // 8. Token overlap matching for long multi-word queries ONLY (filtering out stop-words)
  const keyTokens = Array.from(new Set([...tokenizeText(decodedKey), ...tokenizeText(transliteratedKey)]))
    .filter(t => t.length >= 3 && !STOP_WORDS.has(t));

  if (keyTokens.length >= 3) {
    const transliteratedTitle = artTitle ? transliterateHindiToEnglish(artTitle) : '';
    const artTokens = new Set([
      ...tokenizeText(artTitle).filter(t => !STOP_WORDS.has(t)),
      ...tokenizeText(artSlug).filter(t => !STOP_WORDS.has(t)),
      ...tokenizeText(transliteratedTitle).filter(t => !STOP_WORDS.has(t)),
      ...tokenizeText(transliteratedSlug).filter(t => !STOP_WORDS.has(t))
    ]);

    let matchedCount = 0;
    for (const token of keyTokens) {
      if (artTokens.has(token)) {
        matchedCount++;
      }
    }
    // Require at least 80% overlap of non-stop words
    if (matchedCount >= Math.ceil(keyTokens.length * 0.8) && matchedCount >= 3) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts the raw image data from an article by checking all known fields in order:
 * 1. featuredImage
 * 2. image
 * 3. imageUrl
 * 4. thumbnail
 * 5. galleryImages[0]
 * 6. first image in content (HTML <img> tag or Markdown)
 *
 * Excludes recursive internal endpoints (like /img/ or /api/articles/) to locate actual data.
 */
export function extractArticleRawImage(article: any): string | null {
  if (!article) return null;

  const candidates = [
    article.featuredImage,
    article.image,
    article.imageUrl,
    article.thumbnail
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) {
      const trimmed = c.trim();
      // Exclude circular self-referencing endpoints
      if (!trimmed.startsWith('/img/') && !trimmed.startsWith('/api/articles/') && !trimmed.startsWith('/thumbnail/')) {
        return trimmed;
      }
    }
  }

  // Check galleryImages
  if (Array.isArray(article.galleryImages) && article.galleryImages.length > 0) {
    for (const g of article.galleryImages) {
      if (typeof g === 'string' && g.trim()) {
        const trimmed = g.trim();
        if (!trimmed.startsWith('/img/') && !trimmed.startsWith('/api/articles/') && !trimmed.startsWith('/thumbnail/')) {
          return trimmed;
        }
      }
    }
  }

  // Check first image inside content (HTML <img> or Markdown ![](url))
  if (article.content && typeof article.content === 'string') {
    const htmlMatch = article.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlMatch && htmlMatch[1] && htmlMatch[1].trim()) {
      const trimmed = htmlMatch[1].trim();
      if (!trimmed.startsWith('/img/') && !trimmed.startsWith('/api/articles/')) {
        return trimmed;
      }
    }
    const mdMatch = article.content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+|data:image\/[^\s\)]+)\)/i);
    if (mdMatch && mdMatch[1] && mdMatch[1].trim()) {
      const trimmed = mdMatch[1].trim();
      if (!trimmed.startsWith('/img/') && !trimmed.startsWith('/api/articles/')) {
        return trimmed;
      }
    }
  }

  // If only a local static path (like /uploads/photo.jpg or /assets/photo.jpg) was set
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) {
      const trimmed = c.trim();
      if (trimmed.startsWith('/') && !trimmed.startsWith('/img/') && !trimmed.startsWith('/api/articles/')) {
        return trimmed;
      }
    }
  }

  return null;
}

/**
 * Resolves the absolute, public HTTPS thumbnail image URL for any news article.
 * Guarantees that:
 * - Real uploaded Base64 images are served via /img/:idOrSlug.jpg so WhatsApp/crawlers can fetch binary images.
 * - Base64 strings are NEVER returned directly as og:image.
 * - Articles with HTTPS URLs (CDNs, external storages) return their public HTTPS URL directly.
 * - Local relative paths are converted to absolute HTTPS URLs.
 * - Fallbacks never return random Unsplash images or AI Studio thumbnails, but the official newspaper logo only when no image exists.
 */
export function resolveArticleImageUrl(article: any, baseUrl?: string): string {
  const origin = sanitizePublicOrigin(baseUrl || (typeof window !== 'undefined' ? window.location.origin : undefined));

  if (!article) return `${origin}/logo.png`;

  const rawImg = extractArticleRawImage(article);

  // If article has no uploaded image in any field, use official brand logo fallback
  if (!rawImg || typeof rawImg !== 'string') {
    return `${origin}/logo.png`;
  }

  const trimmed = rawImg.trim();
  if (!trimmed || trimmed.startsWith('data:image/svg')) {
    return `${origin}/logo.png`;
  }

  // Choose the best key for the binary image endpoint:
  // Prefer clean ASCII slug if present; otherwise use article.id
  let cleanKey = '';
  if (article.slug && typeof article.slug === 'string' && /^[a-zA-Z0-9_-]+$/.test(article.slug) && !article.slug.includes('%')) {
    cleanKey = article.slug;
  } else if (article.id && typeof article.id === 'string' && /^[a-zA-Z0-9_-]+$/.test(article.id) && !article.id.includes('%')) {
    cleanKey = article.id;
  } else {
    cleanKey = String(article.id || 'news').replace(/[^a-zA-Z0-9_-]/g, '') || 'news';
  }

  // 1. If Base64 image data or raw inline base64 string
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('data:') ||
    (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/') && trimmed.length > 50)
  ) {
    return `${origin}/img/${encodeURIComponent(cleanKey)}.jpg`;
  }

  // 2. If already an absolute HTTPS URL (e.g. CDN, Cloud Storage)
  if (trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 3. If HTTP, upgrade to HTTPS if not local
  if (trimmed.startsWith('http://')) {
    if (!trimmed.includes('localhost') && !trimmed.includes('127.0.0.1')) {
      return trimmed.replace(/^http:\/\//i, 'https://');
    }
    return trimmed;
  }

  // 4. If relative local public asset path (e.g. /uploads/image.jpg)
  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed}`;
  }

  return `${origin}/img/${encodeURIComponent(cleanKey)}.jpg`;
}
