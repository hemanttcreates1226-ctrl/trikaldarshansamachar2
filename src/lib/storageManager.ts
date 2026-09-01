/**
 * Quota-Safe Local & Memory Storage Manager
 * 
 * Solves DOMException / QuotaExceededError when storing large datasets
 * (e.g. articles with inline Base64 images) in localStorage (~5MB browser limit).
 * 
 * Features:
 * 1. Synchronous in-memory caching so complete data (with full-res images) is always instantly available.
 * 2. Smart storage compression for localStorage (offloads huge base64 strings to proxy URLs or keeps recent items).
 * 3. Graceful quota handling so setItem never throws uncaught exceptions or error logs.
 * 4. Centralized event dispatching on updates.
 */

export const STORAGE_KEYS = {
  NEWS: 'tds_news_articles_v1',
  CATEGORIES: 'tds_categories_v1',
  STATES: 'tds_states_v1',
  DISTRICTS: 'tds_districts_v1',
  REPORTERS: 'tds_reporters_v1',
  APPLICATIONS: 'tds_applications_v1',
  ID_CARDS: 'tds_id_cards_v1',
  JOINING_LETTERS: 'tds_joining_letters_v1',
  ADVERTISEMENTS: 'tds_advertisements_v1',
  SOCIAL_LINKS: 'tds_social_links_v1',
  SETTINGS: 'tds_settings_v1',
  PANCHANG: 'tds_panchang_v1',
  LAST_SYNC: 'tds_last_sync_timestamp'
} as const;

// In-memory cache for ultra-fast, quota-free access
const memoryStore = new Map<string, any>();

// Cross-tab real-time BroadcastChannel for instant zero-latency multi-tab sync on the same device
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('tds_sync_channel');
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.key) {
        const { key, value } = event.data;
        if (value !== undefined) {
          memoryStore.set(key, value);
        } else {
          memoryStore.delete(key);
        }
        window.dispatchEvent(
          new CustomEvent('tds_data_updated', {
            detail: { key, source: 'cross_tab_broadcast' }
          })
        );
      }
    };
  } catch {
    // BroadcastChannel unsupported or blocked
  }
}

// Storage event listener fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && Object.values(STORAGE_KEYS).includes(e.key as any)) {
      if (e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          memoryStore.set(e.key, parsed);
        } catch {}
      }
      window.dispatchEvent(
        new CustomEvent('tds_data_updated', {
          detail: { key: e.key, source: 'storage_event' }
        })
      );
    }
  });
}

export function storageGet<T>(key: string, defaultValue: T): T {
  // 1. Check in-memory store first
  if (memoryStore.has(key)) {
    const val = memoryStore.get(key);
    return val !== undefined && val !== null ? val : defaultValue;
  }

  // 2. Try reading from localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryStore.set(key, parsed);
        return parsed;
      }
    } catch {
      // Graceful fallback to default
    }
  }

  // 3. Fallback to default
  memoryStore.set(key, defaultValue);
  return defaultValue;
}

/**
 * Optimizes an array of articles for local storage by replacing large Base64
 * strings with lightweight binary endpoint references and capping count.
 */
function createStorageOptimizedNews(articles: any[], maxCount = 25): any[] {
  if (!Array.isArray(articles)) return articles;

  const slice = articles.slice(0, maxCount);

  return slice.map(art => {
    if (!art) return art;
    const identifier = art.slug || art.id;
    const binaryEndpoint = identifier ? `/api/articles/${encodeURIComponent(identifier)}/image.jpg` : '';

    let featuredImage = art.featuredImage;
    if (typeof featuredImage === 'string' && (featuredImage.startsWith('data:') || featuredImage.length > 500)) {
      featuredImage = binaryEndpoint || featuredImage;
    }

    let img = art.image;
    if (typeof img === 'string' && (img.startsWith('data:') || img.length > 500)) {
      img = binaryEndpoint || img;
    }

    let audio = art.audioUrl;
    if (typeof audio === 'string' && (audio.startsWith('data:') || audio.length > 500)) {
      audio = '';
    }

    return {
      ...art,
      featuredImage: featuredImage || img,
      image: img || featuredImage,
      audioUrl: audio,
      galleryImages: []
    };
  });
}

function safePersistToLocalStorage(key: string, value: any): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    // Proactively optimize high-volume collections before writing
    if (key === STORAGE_KEYS.NEWS && Array.isArray(value)) {
      const optimized = createStorageOptimizedNews(value, 25);
      localStorage.setItem(key, JSON.stringify(optimized));
      return;
    }

    if (key === STORAGE_KEYS.ADVERTISEMENTS && Array.isArray(value)) {
      const optimizedAds = value.slice(0, 15).map((ad: any) => {
        if (ad?.imageUrl && (ad.imageUrl.startsWith('data:') || ad.imageUrl.length > 500)) {
          return { ...ad, imageUrl: '' };
        }
        return ad;
      });
      localStorage.setItem(key, JSON.stringify(optimizedAds));
      return;
    }

    // Standard write
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err: any) {
    // If quota exceeded or error occurred, execute progressive fallbacks
    try {
      if (key === STORAGE_KEYS.NEWS && Array.isArray(value)) {
        // Fallback 1: Top 10 articles with stripped media
        const smallBatch = createStorageOptimizedNews(value, 10);
        localStorage.setItem(key, JSON.stringify(smallBatch));
      } else {
        // Fallback 2: Remove key from localStorage, rely purely on memoryStore
        try { localStorage.removeItem(key); } catch {}
      }
    } catch {
      // Memory store is already populated and holds the true state
    }
  }
}

export function storageSet<T>(key: string, value: T, notify = true, source?: string): void {
  // 1. Always store full fidelity data in-memory
  memoryStore.set(key, value);

  // 2. Persist safely without throwing or console erroring
  safePersistToLocalStorage(key, value);

  // 3. Broadcast to all other open tabs on this browser
  if (broadcastChannel && source !== 'cross_tab_broadcast') {
    try {
      broadcastChannel.postMessage({ key, value });
    } catch {}
  }

  // 4. Dispatch update event
  if (notify && typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('tds_data_updated', {
          detail: { key, source: source || 'storage_set' }
        })
      );
    } catch {}
  }
}

export function storageRemove(key: string, notify = true): void {
  memoryStore.delete(key);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ key, value: undefined });
    } catch {}
  }

  if (notify && typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('tds_data_updated', {
          detail: { key, source: 'storage_remove' }
        })
      );
    } catch {}
  }
}
