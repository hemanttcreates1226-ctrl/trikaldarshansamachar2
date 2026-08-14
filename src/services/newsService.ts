import {
  NewsArticle,
  Category,
  State,
  District,
  Reporter,
  MemberApplication,
  IDCard,
  JoiningLetter,
  Advertisement,
  SocialLink,
  WebsiteSettings,
  PanchangInfo,
  ApplicationStatus
} from '../types/news';

import {
  INITIAL_NEWS,
  INITIAL_CATEGORIES,
  INITIAL_STATES,
  INITIAL_DISTRICTS,
  INITIAL_REPORTERS,
  INITIAL_APPLICATIONS,
  INITIAL_ID_CARDS,
  INITIAL_JOINING_LETTERS,
  INITIAL_ADVERTISEMENTS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_SETTINGS,
  INITIAL_PANCHANG
} from '../data/initialData';
import { FirestoreSyncService } from './firestoreService';

const STORAGE_KEYS = {
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
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T, notify = true): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (notify && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tds_data_updated', { detail: { key } }));
    }
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

async function apiCall(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(endpoint, options);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Graceful offline/static fallback
    return null;
  }
}

function mergeArticleLists(existing: NewsArticle[], incoming: NewsArticle[]): NewsArticle[] {
  const map = new Map<string, NewsArticle>();
  for (const a of existing) {
    if (a && a.id) map.set(a.id, a);
  }
  for (const b of incoming) {
    if (b && b.id) {
      const prev = map.get(b.id);
      if (!prev) {
        map.set(b.id, b);
      } else {
        const timePrev = new Date(prev.updatedDate || prev.publishDate || 0).getTime();
        const timeIncoming = new Date(b.updatedDate || b.publishDate || 0).getTime();
        if (timeIncoming >= timePrev) {
          map.set(b.id, { ...prev, ...b });
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    return new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime();
  });
}

export class NewsService {
  private static isInitialized = false;
  private static syncInterval: any = null;

  static init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Initialize Cloud Firestore Real-time Listener
    try {
      FirestoreSyncService.init((source) => {
        window.dispatchEvent(new CustomEvent('tds_data_updated', { detail: { source } }));
      });
    } catch (e) {
      console.warn('Firestore sync fallback:', e);
    }

    // 2. Initial background sync from server
    this.syncFromServer(true);

    // Background periodic poll every 5 seconds
    this.syncInterval = setInterval(() => {
      this.syncFromServer();
    }, 5000);

    // Refresh immediately when user switches tabs or returns to browser
    window.addEventListener('focus', () => {
      this.syncFromServer(false);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.syncFromServer(false);
      }
    });

    window.addEventListener('online', () => {
      this.syncFromServer(true);
    });
  }

  static async syncFromServer(force: boolean = false): Promise<boolean> {
    try {
      const res = await apiCall('/api/data');
      if (!res || !res.success || !res.data) return false;

      const serverData = res.data;
      const lastLocalSync = Number(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '0');
      const localArticles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, []);

      const serverUpdated = Number(serverData.lastUpdated || 0);
      const shouldSync =
        force ||
        localArticles.length === 0 ||
        !lastLocalSync ||
        serverUpdated > lastLocalSync;

      if (shouldSync) {
        if (Array.isArray(serverData.news) && serverData.news.length > 0) {
          const merged = mergeArticleLists(localArticles, serverData.news);
          setItem(STORAGE_KEYS.NEWS, merged, false);
        }
        if (Array.isArray(serverData.categories)) setItem(STORAGE_KEYS.CATEGORIES, serverData.categories, false);
        if (Array.isArray(serverData.states)) setItem(STORAGE_KEYS.STATES, serverData.states, false);
        if (Array.isArray(serverData.districts)) setItem(STORAGE_KEYS.DISTRICTS, serverData.districts, false);
        if (Array.isArray(serverData.reporters)) setItem(STORAGE_KEYS.REPORTERS, serverData.reporters, false);
        if (Array.isArray(serverData.applications)) setItem(STORAGE_KEYS.APPLICATIONS, serverData.applications, false);
        if (Array.isArray(serverData.idCards)) setItem(STORAGE_KEYS.ID_CARDS, serverData.idCards, false);
        if (Array.isArray(serverData.joiningLetters)) setItem(STORAGE_KEYS.JOINING_LETTERS, serverData.joiningLetters, false);
        if (Array.isArray(serverData.advertisements)) setItem(STORAGE_KEYS.ADVERTISEMENTS, serverData.advertisements, false);
        if (Array.isArray(serverData.socialLinks)) setItem(STORAGE_KEYS.SOCIAL_LINKS, serverData.socialLinks, false);
        if (serverData.settings) setItem(STORAGE_KEYS.SETTINGS, serverData.settings, false);
        if (serverData.panchang) setItem(STORAGE_KEYS.PANCHANG, serverData.panchang, false);

        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(serverUpdated || Date.now()));
        window.dispatchEvent(new CustomEvent('tds_data_updated', { detail: { source: 'server_sync' } }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static async pushSnapshotToServer(): Promise<void> {
    try {
      const payload = {
        news: getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS),
        categories: getItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
        states: getItem(STORAGE_KEYS.STATES, INITIAL_STATES),
        districts: getItem(STORAGE_KEYS.DISTRICTS, INITIAL_DISTRICTS),
        reporters: getItem(STORAGE_KEYS.REPORTERS, INITIAL_REPORTERS),
        applications: getItem(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS),
        idCards: getItem(STORAGE_KEYS.ID_CARDS, INITIAL_ID_CARDS),
        joiningLetters: getItem(STORAGE_KEYS.JOINING_LETTERS, INITIAL_JOINING_LETTERS),
        advertisements: getItem(STORAGE_KEYS.ADVERTISEMENTS, INITIAL_ADVERTISEMENTS),
        socialLinks: getItem(STORAGE_KEYS.SOCIAL_LINKS, INITIAL_SOCIAL_LINKS),
        settings: getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
        panchang: getItem(STORAGE_KEYS.PANCHANG, INITIAL_PANCHANG)
      };
      const res = await apiCall('/api/data/sync', 'POST', payload);
      if (res?.lastUpdated) {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(res.lastUpdated));
      }
    } catch {
      // Ignore network failures
    }
  }

  // --- NEWS ARTICLES ---
  static getArticles(filters?: {
    categorySlug?: string;
    stateId?: string;
    districtId?: string;
    searchQuery?: string;
    status?: string;
    isBreaking?: boolean;
    isFeatured?: boolean;
    isSpecialReport?: boolean;
    limit?: number;
  }): NewsArticle[] {
    let articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        articles = articles.filter(a => a.status === filters.status);
      } else if (!filters.status) {
        articles = articles.filter(a => a.status === 'published');
      }

      if (filters.categorySlug && filters.categorySlug !== 'all' && filters.categorySlug !== 'latest-news') {
        articles = articles.filter(a => a.categorySlug === filters.categorySlug);
      }

      if (filters.stateId && filters.stateId !== 'all') {
        articles = articles.filter(a => a.stateId === filters.stateId);
      }

      if (filters.districtId && filters.districtId !== 'all') {
        articles = articles.filter(a => a.districtId === filters.districtId);
      }

      if (filters.isBreaking !== undefined) {
        articles = articles.filter(a => a.isBreaking === filters.isBreaking);
      }

      if (filters.isFeatured !== undefined) {
        articles = articles.filter(a => a.isFeatured === filters.isFeatured);
      }

      if (filters.isSpecialReport !== undefined) {
        articles = articles.filter(a => a.isSpecialReport === filters.isSpecialReport);
      }

      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase().trim();
        articles = articles.filter(a => 
          (a.title && a.title.toLowerCase().includes(query)) ||
          (a.summary && a.summary.toLowerCase().includes(query)) ||
          (a.content && a.content.toLowerCase().includes(query)) ||
          (a.tags && a.tags.some(t => t.toLowerCase().includes(query))) ||
          (a.authorName && a.authorName.toLowerCase().includes(query))
        );
      }
    }

    articles.sort((a, b) => {
      const dateA = new Date(a.publishDate || a.updatedDate || 0).getTime();
      const dateB = new Date(b.publishDate || b.updatedDate || 0).getTime();
      return dateB - dateA;
    });

    if (filters?.limit && filters.limit > 0) {
      return articles.slice(0, filters.limit);
    }

    return articles;
  }

  static getArticleByIdOrSlug(idOrSlug: string): NewsArticle | null {
    const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const found = articles.find(a => a.id === idOrSlug || a.slug === idOrSlug);
    if (found) {
      found.views = (found.views || 0) + 1;
      setItem(STORAGE_KEYS.NEWS, articles, false);
      return found;
    }
    return null;
  }

  static async fetchArticleAsync(idOrSlug: string): Promise<NewsArticle | null> {
    // 1. Try local cache first
    const cached = this.getArticleByIdOrSlug(idOrSlug);
    if (cached) return cached;

    // 2. Try fetching directly from Cloud Firestore
    try {
      const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');

      // Check by doc ID
      const docRef = doc(db, 'news', idOrSlug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const article = docSnap.data() as NewsArticle;
        if (article && article.id) {
          const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
          const existingIdx = articles.findIndex(a => a.id === article.id);
          if (existingIdx !== -1) {
            articles[existingIdx] = article;
          } else {
            articles.unshift(article);
          }
          setItem(STORAGE_KEYS.NEWS, articles);
          return article;
        }
      }

      // Check by slug
      const q = query(collection(db, 'news'), where('slug', '==', idOrSlug));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const article = qSnap.docs[0].data() as NewsArticle;
        if (article && article.id) {
          const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
          const existingIdx = articles.findIndex(a => a.id === article.id);
          if (existingIdx !== -1) {
            articles[existingIdx] = article;
          } else {
            articles.unshift(article);
          }
          setItem(STORAGE_KEYS.NEWS, articles);
          return article;
        }
      }
    } catch (e) {
      console.warn('Firestore direct fetch notice:', e);
    }

    // 3. Fetch directly from server API if not found locally or in firestore
    try {
      const serverArticle = await apiCall(`/api/articles/${encodeURIComponent(idOrSlug)}`);
      if (serverArticle && serverArticle.id) {
        const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
        const existingIdx = articles.findIndex(a => a.id === serverArticle.id);
        if (existingIdx !== -1) {
          articles[existingIdx] = serverArticle;
        } else {
          articles.unshift(serverArticle);
        }
        setItem(STORAGE_KEYS.NEWS, articles);
        return serverArticle;
      }
    } catch {
      // offline fallback
    }

    return null;
  }

  static incrementViews(id: string): void {
    const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const article = articles.find(a => a.id === id);
    if (article) {
      article.views = (article.views || 0) + 1;
      setItem(STORAGE_KEYS.NEWS, articles, false);
    }
  }

  static saveArticle(articleData: Partial<NewsArticle>): NewsArticle {
    const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const now = new Date().toISOString();

    let targetArticle: NewsArticle;

    if (articleData.id) {
      const index = articles.findIndex(a => a.id === articleData.id);
      if (index !== -1) {
        targetArticle = {
          ...articles[index],
          ...articleData,
          updatedDate: now
        } as NewsArticle;
        articles[index] = targetArticle;
      } else {
        targetArticle = {
          id: articleData.id,
          title: articleData.title || 'शीर्षक रहित समाचार',
          subtitle: articleData.subtitle || '',
          content: articleData.content || '',
          summary: articleData.summary || articleData.content?.slice(0, 150) || '',
          featuredImage: articleData.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
          categorySlug: articleData.categorySlug || 'latest-news',
          categoryName: articleData.categoryName || 'ताज़ा खबर',
          stateId: articleData.stateId || 'st-mp',
          stateName: articleData.stateName || 'मध्य प्रदेश',
          districtId: articleData.districtId || 'dt-ujn',
          districtName: articleData.districtName || 'उज्जैन',
          cityName: articleData.cityName || '',
          reporterId: articleData.reporterId || '',
          reporterName: articleData.reporterName || '',
          authorName: articleData.authorName || 'त्रिकाल सम्पादकीय',
          tags: articleData.tags || ['समाचार', 'त्रिकाल दर्शन'],
          views: articleData.views || 1,
          isBreaking: !!articleData.isBreaking,
          isFeatured: !!articleData.isFeatured,
          isSpecialReport: !!articleData.isSpecialReport,
          publishDate: articleData.publishDate || now,
          status: articleData.status || 'published',
          slug: articleData.slug || `news-${Date.now()}`
        };
        articles.unshift(targetArticle);
      }
    } else {
      const slug = articleData.title
        ? articleData.title.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, '-').replace(/^-+|-+$/g, '')
        : `news-${Date.now()}`;

      targetArticle = {
        id: `news-${Date.now()}`,
        title: articleData.title || 'शीर्षक रहित समाचार',
        subtitle: articleData.subtitle || '',
        content: articleData.content || '',
        summary: articleData.summary || articleData.content?.slice(0, 150) || '',
        featuredImage: articleData.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
        categorySlug: articleData.categorySlug || 'latest-news',
        categoryName: articleData.categoryName || 'ताज़ा खबर',
        stateId: articleData.stateId || 'st-mp',
        stateName: articleData.stateName || 'मध्य प्रदेश',
        districtId: articleData.districtId || 'dt-ujn',
        districtName: articleData.districtName || 'उज्जैन',
        cityName: articleData.cityName || '',
        reporterId: articleData.reporterId || '',
        reporterName: articleData.reporterName || '',
        authorName: articleData.authorName || 'त्रिकाल सम्पादकीय',
        tags: articleData.tags || ['समाचार', 'त्रिकाल दर्शन'],
        views: 1,
        isBreaking: !!articleData.isBreaking,
        isFeatured: !!articleData.isFeatured,
        isSpecialReport: !!articleData.isSpecialReport,
        publishDate: articleData.publishDate || now,
        status: articleData.status || 'published',
        slug: slug || `news-${Date.now()}`
      };
      articles.unshift(targetArticle);
    }

    setItem(STORAGE_KEYS.NEWS, articles);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(Date.now()));

    // 1. Save to Cloud Firestore for real-time live synchronization across all browsers/devices
    FirestoreSyncService.saveArticle(targetArticle);

    // 2. Synchronize to server immediately and push full snapshot
    apiCall('/api/articles', 'POST', targetArticle).then(() => {
      NewsService.pushSnapshotToServer();
    });

    return targetArticle;
  }

  static deleteArticle(id: string): void {
    const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const filtered = articles.filter(a => a.id !== id);
    setItem(STORAGE_KEYS.NEWS, filtered);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(Date.now()));

    // 1. Delete from Cloud Firestore
    FirestoreSyncService.deleteArticle(id);

    // 2. Delete from server
    apiCall(`/api/articles/${id}`, 'DELETE').then(() => {
      NewsService.pushSnapshotToServer();
    });
  }

  // --- CATEGORIES ---
  static getCategories(): Category[] {
    const cats: Category[] = getItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  static addCategory(catData: Partial<Category>): Category {
    return this.saveCategory(catData);
  }

  static saveCategory(category: Partial<Category>): Category {
    const categories: Category[] = getItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    let targetCat: Category;

    if (category.id) {
      const idx = categories.findIndex(c => c.id === category.id);
      if (idx !== -1) {
        targetCat = { ...categories[idx], ...category };
        categories[idx] = targetCat;
      } else {
        targetCat = {
          id: category.id,
          nameHindi: category.nameHindi || 'नई श्रेणी',
          nameEnglish: category.nameEnglish || 'New Category',
          slug: category.slug || `cat-${Date.now()}`,
          iconName: category.iconName || 'Newspaper',
          sortOrder: category.sortOrder || categories.length + 1,
          isHidden: category.isHidden !== undefined ? category.isHidden : false
        };
        categories.push(targetCat);
      }
    } else {
      targetCat = {
        id: `cat-${Date.now()}`,
        nameHindi: category.nameHindi || 'नई श्रेणी',
        nameEnglish: category.nameEnglish || 'New Category',
        slug: category.slug || `cat-${Date.now()}`,
        iconName: category.iconName || 'Newspaper',
        sortOrder: categories.length + 1,
        isHidden: false
      };
      categories.push(targetCat);
    }

    setItem(STORAGE_KEYS.CATEGORIES, categories);
    FirestoreSyncService.saveCategory(targetCat);
    apiCall('/api/categories', 'POST', targetCat);
    return targetCat;
  }

  static deleteCategory(id: string): void {
    const categories: Category[] = getItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setItem(STORAGE_KEYS.CATEGORIES, categories.filter(c => c.id !== id));
    FirestoreSyncService.deleteCategory(id);
    apiCall(`/api/categories/${id}`, 'DELETE');
  }

  // --- LOCATIONS ---
  static getStates(): State[] {
    return getItem(STORAGE_KEYS.STATES, INITIAL_STATES);
  }

  static saveState(state: Partial<State>): State {
    const states: State[] = getItem(STORAGE_KEYS.STATES, INITIAL_STATES);
    let targetState: State;

    if (state.id) {
      const idx = states.findIndex(s => s.id === state.id);
      if (idx !== -1) {
        targetState = { ...states[idx], ...state };
        states[idx] = targetState;
      } else {
        targetState = {
          id: state.id,
          nameHindi: state.nameHindi || 'नया राज्य',
          nameEnglish: state.nameEnglish || 'New State',
          slug: state.slug || `state-${Date.now()}`,
          isEnabled: true
        };
        states.push(targetState);
      }
    } else {
      targetState = {
        id: `st-${Date.now()}`,
        nameHindi: state.nameHindi || 'नया राज्य',
        nameEnglish: state.nameEnglish || 'New State',
        slug: state.slug || `state-${Date.now()}`,
        isEnabled: true
      };
      states.push(targetState);
    }

    setItem(STORAGE_KEYS.STATES, states);
    FirestoreSyncService.saveState(targetState);
    return targetState;
  }

  static getDistricts(stateId?: string): District[] {
    const districts: District[] = getItem(STORAGE_KEYS.DISTRICTS, INITIAL_DISTRICTS);
    if (stateId && stateId !== 'all') {
      return districts.filter(d => d.stateId === stateId);
    }
    return districts;
  }

  static addDistrict(district: Partial<District>): District {
    return this.saveDistrict(district);
  }

  static saveDistrict(district: Partial<District>): District {
    const districts: District[] = getItem(STORAGE_KEYS.DISTRICTS, INITIAL_DISTRICTS);
    let targetDt: District;

    if (district.id) {
      const idx = districts.findIndex(d => d.id === district.id);
      if (idx !== -1) {
        targetDt = { ...districts[idx], ...district };
        districts[idx] = targetDt;
      } else {
        targetDt = {
          id: district.id,
          stateId: district.stateId || 'st-mp',
          nameHindi: district.nameHindi || 'नया जिला',
          nameEnglish: district.nameEnglish || 'New District',
          slug: district.slug || `district-${Date.now()}`,
          isEnabled: true
        };
        districts.push(targetDt);
      }
    } else {
      targetDt = {
        id: `dt-${Date.now()}`,
        stateId: district.stateId || 'st-mp',
        nameHindi: district.nameHindi || 'नया जिला',
        nameEnglish: district.nameEnglish || 'New District',
        slug: district.slug || `district-${Date.now()}`,
        isEnabled: true
      };
      districts.push(targetDt);
    }

    setItem(STORAGE_KEYS.DISTRICTS, districts);
    FirestoreSyncService.saveDistrict(targetDt);
    apiCall('/api/districts', 'POST', targetDt);
    return targetDt;
  }

  static deleteDistrict(id: string): void {
    const districts: District[] = getItem(STORAGE_KEYS.DISTRICTS, INITIAL_DISTRICTS);
    setItem(STORAGE_KEYS.DISTRICTS, districts.filter(d => d.id !== id));
    FirestoreSyncService.deleteDistrict(id);
    apiCall(`/api/districts/${id}`, 'DELETE');
  }

  // --- REPORTERS ---
  static getReporters(): Reporter[] {
    return getItem(STORAGE_KEYS.REPORTERS, INITIAL_REPORTERS);
  }

  static addReporter(reporter: Partial<Reporter>): Reporter {
    return this.saveReporter(reporter);
  }

  static saveReporter(reporter: Partial<Reporter>): Reporter {
    const reporters: Reporter[] = getItem(STORAGE_KEYS.REPORTERS, INITIAL_REPORTERS);
    let targetRep: Reporter;

    if (reporter.id) {
      const idx = reporters.findIndex(r => r.id === reporter.id);
      if (idx !== -1) {
        targetRep = { ...reporters[idx], ...reporter };
        reporters[idx] = targetRep;
      } else {
        targetRep = {
          id: reporter.id,
          name: reporter.name || 'संवाददाता',
          photo: reporter.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
          mobile: reporter.mobile || '',
          email: reporter.email || '',
          designation: reporter.designation || 'संवाददाता',
          role: reporter.role || 'reporter',
          stateId: reporter.stateId || 'st-mp',
          stateName: reporter.stateName || 'मध्य प्रदेश',
          districtId: reporter.districtId || 'dt-ujn',
          districtName: reporter.districtName || 'उज्जैन',
          bio: reporter.bio || '',
          articlesCount: 0,
          status: 'active',
          memberId: reporter.memberId || `TDS-MEM-${Math.floor(8000 + Math.random() * 1000)}`
        };
        reporters.push(targetRep);
      }
    } else {
      targetRep = {
        id: `rep-${Date.now()}`,
        name: reporter.name || 'संवाददाता',
        photo: reporter.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        mobile: reporter.mobile || '',
        email: reporter.email || '',
        designation: reporter.designation || 'संवाददाता',
        role: reporter.role || 'reporter',
        stateId: reporter.stateId || 'st-mp',
        stateName: reporter.stateName || 'मध्य प्रदेश',
        districtId: reporter.districtId || 'dt-ujn',
        districtName: reporter.districtName || 'उज्जैन',
        bio: reporter.bio || '',
        articlesCount: 0,
        status: 'active',
        memberId: `TDS-MEM-${Math.floor(8000 + Math.random() * 1000)}`
      };
      reporters.push(targetRep);
    }

    setItem(STORAGE_KEYS.REPORTERS, reporters);
    FirestoreSyncService.saveReporter(targetRep);
    apiCall('/api/reporters', 'POST', targetRep);
    return targetRep;
  }

  static deleteReporter(id: string): void {
    const reporters: Reporter[] = getItem(STORAGE_KEYS.REPORTERS, INITIAL_REPORTERS);
    const filtered = reporters.filter(r => r.id !== id);
    setItem(STORAGE_KEYS.REPORTERS, filtered);
    FirestoreSyncService.deleteReporter(id);
    apiCall(`/api/reporters/${id}`, 'DELETE');
  }

  // --- MEMBER APPLICATIONS ---
  static getApplications(): MemberApplication[] {
    return getItem(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }

  static submitApplication(appData: Omit<MemberApplication, 'id' | 'status' | 'submittedAt'>): MemberApplication {
    const apps: MemberApplication[] = getItem(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const appId = `TDS-APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: MemberApplication = {
      ...appData,
      id: appId,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    apps.unshift(newApp);
    setItem(STORAGE_KEYS.APPLICATIONS, apps);
    FirestoreSyncService.saveApplication(newApp);
    apiCall('/api/applications', 'POST', newApp);
    return newApp;
  }

  static approveApplication(id: string, remarks?: string): MemberApplication | null {
    return this.updateApplicationStatus(id, 'approved', remarks);
  }

  static rejectApplication(id: string, remarks?: string): MemberApplication | null {
    return this.updateApplicationStatus(id, 'rejected', remarks);
  }

  static updateApplicationStatus(id: string, status: ApplicationStatus, remarks?: string): MemberApplication | null {
    const apps: MemberApplication[] = getItem(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const idx = apps.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const app = apps[idx];
    app.status = status;
    if (remarks) app.adminRemarks = remarks;

    if (status === 'approved' && !app.memberId) {
      app.memberId = `TDS-MEM-${Math.floor(8000 + Math.random() * 1000)}`;
      app.pressId = `TDS-PRESS-${Math.floor(1000 + Math.random() * 9000)}`;

      this.generateIDCardForApp(app);
      this.generateJoiningLetterForApp(app);

      this.saveReporter({
        name: app.fullName,
        photo: app.photoUrl,
        mobile: app.mobile,
        email: app.email,
        designation: app.position === 'bureau_chief' ? 'ब्यूरो चीफ' : 'पत्रकार / संवाददाता',
        role: app.position,
        stateId: app.stateId,
        stateName: app.stateName,
        districtId: app.districtId,
        districtName: app.districtName,
        bio: `${app.qualification}। ${app.experience}`
      });
    }

    apps[idx] = app;
    setItem(STORAGE_KEYS.APPLICATIONS, apps);
    FirestoreSyncService.saveApplication(app);
    apiCall(`/api/applications/${id}`, 'PUT', { status, adminRemarks: remarks, memberId: app.memberId, pressId: app.pressId });
    return app;
  }

  static deleteApplication(id: string): void {
    const apps: MemberApplication[] = getItem(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    setItem(STORAGE_KEYS.APPLICATIONS, apps.filter(a => a.id !== id));
    FirestoreSyncService.deleteApplication(id);
    apiCall(`/api/applications/${id}`, 'DELETE');
  }

  // --- ID CARDS & JOINING LETTERS ---
  static getIDCards(): IDCard[] {
    return getItem(STORAGE_KEYS.ID_CARDS, INITIAL_ID_CARDS);
  }

  static deleteIDCard(id: string): void {
    const idCards: IDCard[] = getItem(STORAGE_KEYS.ID_CARDS, INITIAL_ID_CARDS);
    setItem(STORAGE_KEYS.ID_CARDS, idCards.filter(c => c.id !== id));
    apiCall(`/api/id-cards/${id}`, 'DELETE');
  }

  static generateIDCardForApp(app: MemberApplication): IDCard {
    const idCards: IDCard[] = getItem(STORAGE_KEYS.ID_CARDS, INITIAL_ID_CARDS);
    const existing = idCards.find(c => c.applicationId === app.id);
    if (existing) return existing;

    const issue = new Date();
    const valid = new Date();
    valid.setFullYear(valid.getFullYear() + 1);

    const pressId = app.pressId || `TDS-PRESS-${Math.floor(1000 + Math.random() * 9000)}`;
    const memberId = app.memberId || `TDS-MEM-${Math.floor(8000 + Math.random() * 1000)}`;

    const newCard: IDCard = {
      id: `id-card-${Date.now()}`,
      applicationId: app.id,
      memberId,
      pressId,
      name: app.fullName,
      designation: app.position === 'bureau_chief' ? 'ब्यूरो चीफ (Press)' : 'जिला संवाददाता (Press)',
      photo: app.photoUrl,
      stateName: app.stateName,
      districtName: app.districtName,
      qrCodeData: `https://trikaldarshan.com/verify/${pressId}`,
      issueDate: issue.toISOString().split('T')[0],
      validUntil: valid.toISOString().split('T')[0],
      status: 'active'
    };

    idCards.unshift(newCard);
    setItem(STORAGE_KEYS.ID_CARDS, idCards);
    apiCall('/api/id-cards', 'POST', newCard);
    return newCard;
  }

  static getJoiningLetters(): JoiningLetter[] {
    return getItem(STORAGE_KEYS.JOINING_LETTERS, INITIAL_JOINING_LETTERS);
  }

  static saveJoiningLetter(letterData: Partial<JoiningLetter>): JoiningLetter {
    const letters: JoiningLetter[] = getItem(STORAGE_KEYS.JOINING_LETTERS, INITIAL_JOINING_LETTERS);
    let targetLetter: JoiningLetter;

    if (letterData.id) {
      const idx = letters.findIndex(l => l.id === letterData.id);
      if (idx !== -1) {
        targetLetter = { ...letters[idx], ...letterData } as JoiningLetter;
        letters[idx] = targetLetter;
      } else {
        targetLetter = {
          id: letterData.id,
          letterNo: letterData.letterNo || `TDS/HR/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
          applicationId: letterData.applicationId || '',
          memberId: letterData.memberId || `TDS-MEM-${Math.floor(8000 + Math.random() * 1000)}`,
          name: letterData.name || 'पत्रकार का नाम',
          designation: letterData.designation || 'जिला संवाददाता',
          stateName: letterData.stateName || 'मध्य प्रदेश',
          districtName: letterData.districtName || 'उज्जैन',
          issueDate: letterData.issueDate || new Date().toISOString().split('T')[0],
          joiningDate: letterData.joiningDate || new Date().toISOString().split('T')[0],
          responsibilities: letterData.responsibilities || [
            'सत्य, पारदर्शी एवं निष्पक्ष समाचारों का संकलन।',
            'सम्पादकीय नीतियों एवं आचार संहिता का पालन।',
            'जनसमस्याओं और विकास कार्यों का यथार्थवादी कवरेज।'
          ],
          terms: letterData.terms || [
            'यह नियुक्ति पत्र त्रिकाल दर्शन समाचार मीडिया हाऊस द्वारा जारी अधिकृत दस्तावेज है।',
            'पत्रकारिता के नैतिक मूल्यों का उल्लंघन करने पर नियुक्ति स्वतः निरस्त मानी जाएगी।',
            'प्रेस परिचय पत्र केवल समाचार संकलन कार्य हेतु मान्य होगा।'
          ],
          editorName: letterData.editorName || 'राजकमल पांडेय - प्रधान सम्पादक (Editor-in-Chief)'
        };
        letters.unshift(targetLetter);
      }
    } else {
      targetLetter = {
        id: `jl-${Date.now()}`,
        letterNo: letterData.letterNo || `TDS/HR/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        applicationId: letterData.applicationId || '',
        memberId: letterData.memberId || `TDS-MEM-${Math.floor(8000 + Math.random() * 1000)}`,
        name: letterData.name || 'पत्रकार का नाम',
        designation: letterData.designation || 'जिला संवाददाता',
        stateName: letterData.stateName || 'मध्य प्रदेश',
        districtName: letterData.districtName || 'उज्जैन',
        issueDate: letterData.issueDate || new Date().toISOString().split('T')[0],
        joiningDate: letterData.joiningDate || new Date().toISOString().split('T')[0],
        responsibilities: letterData.responsibilities || [
          'सत्य, पारदर्शी एवं निष्पक्ष समाचारों का संकलन।',
          'सम्पादकीय नीतियों एवं आचार संहिता का पालन।',
          'जनसमस्याओं और विकास कार्यों का यथार्थवादी कवरेज।'
        ],
        terms: letterData.terms || [
          'यह नियुक्ति पत्र त्रिकाल दर्शन समाचार मीडिया हाऊस द्वारा जारी अधिकृत दस्तावेज है।',
          'पत्रकारिता के नैतिक मूल्यों का उल्लंघन करने पर नियुक्ति स्वतः निरस्त मानी जाएगी।',
          'प्रेस परिचय पत्र केवल समाचार संकलन कार्य हेतु मान्य होगा।'
        ],
        editorName: letterData.editorName || 'राजकमल पांडेय - प्रधान सम्पादक (Editor-in-Chief)'
      };
      letters.unshift(targetLetter);
    }

    setItem(STORAGE_KEYS.JOINING_LETTERS, letters);
    FirestoreSyncService.saveJoiningLetter(targetLetter);
    apiCall('/api/joining-letters', 'POST', targetLetter);
    return targetLetter;
  }

  static deleteJoiningLetter(id: string): void {
    const letters: JoiningLetter[] = getItem(STORAGE_KEYS.JOINING_LETTERS, INITIAL_JOINING_LETTERS);
    const filtered = letters.filter(l => l.id !== id);
    setItem(STORAGE_KEYS.JOINING_LETTERS, filtered);
    FirestoreSyncService.deleteJoiningLetter(id);
    apiCall(`/api/joining-letters/${id}`, 'DELETE');
  }

  static generateJoiningLetterForApp(app: MemberApplication): JoiningLetter {
    const letters: JoiningLetter[] = getItem(STORAGE_KEYS.JOINING_LETTERS, INITIAL_JOINING_LETTERS);
    const existing = letters.find(l => l.applicationId === app.id);
    if (existing) return existing;

    const issueDate = new Date().toISOString().split('T')[0];

    const newLetter: JoiningLetter = {
      id: `jl-${Date.now()}`,
      letterNo: `TDS/HR/${new Date().getFullYear()}/${app.memberId || '8800'}`,
      applicationId: app.id,
      memberId: app.memberId || 'TDS-MEM-8800',
      name: app.fullName,
      designation: app.position === 'bureau_chief' ? 'ब्यूरो चीफ' : 'जिला संवाददाता',
      stateName: app.stateName,
      districtName: app.districtName,
      issueDate,
      joiningDate: issueDate,
      responsibilities: [
        `${app.districtName} क्षेत्र में सत्य, पारदर्शी एवं निष्पक्ष समाचारों का संकलन।`,
        'त्रिकाल दर्शन समाचार की सम्पादकीय नीतियों एवं आचार संहिता का निष्ठापूर्वक पालन।',
        'स्थानीय जनसमस्याओं और विकास कार्यों का यथार्थवादी कवरेज।'
      ],
      terms: [
        'यह नियुक्ति पत्र त्रिकाल दर्शन समाचार मीडिया हाऊस द्वारा जारी अधिकृत दस्तावेज है।',
        'प्रेस परिचय पत्र एवं लोगो का दुरुपयोग दंडनीय अपराध होगा।'
      ]
    };

    letters.unshift(newLetter);
    setItem(STORAGE_KEYS.JOINING_LETTERS, letters);
    FirestoreSyncService.saveJoiningLetter(newLetter);
    apiCall('/api/joining-letters', 'POST', newLetter);
    return newLetter;
  }

  // --- ADVERTISEMENTS & SOCIAL LINKS ---
  static getAdvertisements(): Advertisement[] {
    return getItem(STORAGE_KEYS.ADVERTISEMENTS, INITIAL_ADVERTISEMENTS);
  }

  static addAdvertisement(adData: Partial<Advertisement>): Advertisement {
    return this.saveAdvertisement(adData);
  }

  static saveAdvertisement(adData: Partial<Advertisement>): Advertisement {
    const ads: Advertisement[] = getItem(STORAGE_KEYS.ADVERTISEMENTS, INITIAL_ADVERTISEMENTS);
    let targetAd: Advertisement;

    if (adData.id) {
      const idx = ads.findIndex(a => a.id === adData.id);
      if (idx !== -1) {
        targetAd = { ...ads[idx], ...adData };
        ads[idx] = targetAd;
      } else {
        targetAd = {
          id: adData.id,
          title: adData.title || 'विज्ञापन',
          type: adData.type || 'top_banner',
          imageUrl: adData.imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
          targetUrl: adData.targetUrl || '#',
          startDate: adData.startDate || new Date().toISOString().split('T')[0],
          endDate: adData.endDate || '2026-12-31',
          isActive: true,
          impressions: 0,
          clicks: 0
        };
        ads.push(targetAd);
      }
    } else {
      targetAd = {
        id: `ad-${Date.now()}`,
        title: adData.title || 'विज्ञापन',
        type: adData.type || 'top_banner',
        imageUrl: adData.imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
        targetUrl: adData.targetUrl || '#',
        startDate: adData.startDate || new Date().toISOString().split('T')[0],
        endDate: adData.endDate || '2026-12-31',
        isActive: true,
        impressions: 0,
        clicks: 0
      };
      ads.push(targetAd);
    }

    setItem(STORAGE_KEYS.ADVERTISEMENTS, ads);
    FirestoreSyncService.saveAdvertisement(targetAd);
    apiCall('/api/advertisements', 'POST', targetAd);
    return targetAd;
  }

  static deleteAdvertisement(id: string): void {
    const ads: Advertisement[] = getItem(STORAGE_KEYS.ADVERTISEMENTS, INITIAL_ADVERTISEMENTS);
    setItem(STORAGE_KEYS.ADVERTISEMENTS, ads.filter(a => a.id !== id));
    FirestoreSyncService.deleteAdvertisement(id);
    apiCall(`/api/advertisements/${id}`, 'DELETE');
  }

  static sanitizeUrl(url?: string): string {
    if (!url) return '#';
    let clean = url.trim();
    if (!clean) return '#';
    if (clean === '#') return '#';
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }
    return clean;
  }

  static getSocialLinks(): SocialLink[] {
    return getItem(STORAGE_KEYS.SOCIAL_LINKS, INITIAL_SOCIAL_LINKS);
  }

  static saveSocialLinks(links: SocialLink[]): void {
    setItem(STORAGE_KEYS.SOCIAL_LINKS, links);
    apiCall('/api/social-links', 'POST', links);
  }

  // --- SETTINGS & BRANDING ---
  static getSettings(): WebsiteSettings {
    const defaultSettings: WebsiteSettings = {
      brandTitle: 'त्रिकाल दर्शन समाचार',
      brandBadgeText: 'राष्ट्रीय हिन्दी दैनिक',
      siteName: 'त्रिकाल दर्शन समाचार',
      taglineHindi: 'सत्यमेव जयते • राष्ट्र का सजग प्रहरी',
      tagline: 'Truth Prevails • Voice of the Nation',
      editorName: 'राजकमल पांडेय',
      contactEmail: 'editor@trikaldarshan.com',
      contactNumber: '+91 98260 00000',
      addressHindi: 'प्रेस परिसर, नानाखेड़ा, उज्जैन (म.प्र.) 456010',
      socialLinks: {
        facebook: 'https://facebook.com/trikaldarshan',
        twitter: 'https://twitter.com/trikaldarshan',
        instagram: 'https://instagram.com/trikaldarshan',
        youtube: 'https://youtube.com/trikaldarshan',
        whatsappChannel: 'https://whatsapp.com/channel/trikaldarshan',
        telegram: 'https://t.me/trikaldarshan'
      },
      ...INITIAL_SETTINGS
    };
    return getItem<WebsiteSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  }

  static updateSettings(settings: Partial<WebsiteSettings>): WebsiteSettings {
    const current = getItem<WebsiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const updated = { ...current, ...settings };
    setItem(STORAGE_KEYS.SETTINGS, updated);
    FirestoreSyncService.saveSettings(updated);

    // If socialLinks object was included, also update STORAGE_KEYS.SOCIAL_LINKS
    if (settings.socialLinks) {
      const socialArray: SocialLink[] = [
        { id: 'soc-fb', platform: 'facebook', label: 'Facebook', url: settings.socialLinks.facebook || '', isEnabled: !!settings.socialLinks.facebook },
        { id: 'soc-tw', platform: 'twitter', label: 'Twitter / X', url: settings.socialLinks.twitter || '', isEnabled: !!settings.socialLinks.twitter },
        { id: 'soc-yt', platform: 'youtube', label: 'YouTube', url: settings.socialLinks.youtube || '', isEnabled: !!settings.socialLinks.youtube },
        { id: 'soc-ig', platform: 'instagram', label: 'Instagram', url: settings.socialLinks.instagram || '', isEnabled: !!settings.socialLinks.instagram },
        { id: 'soc-wa', platform: 'whatsapp', label: 'WhatsApp', url: settings.socialLinks.whatsappChannel || '', isEnabled: !!settings.socialLinks.whatsappChannel },
        { id: 'soc-tg', platform: 'telegram', label: 'Telegram', url: settings.socialLinks.telegram || '', isEnabled: !!settings.socialLinks.telegram }
      ];
      setItem(STORAGE_KEYS.SOCIAL_LINKS, socialArray);
    }

    apiCall('/api/settings', 'PUT', updated);
    return updated;
  }

  // --- PANCHANG ---
  static getPanchang(): PanchangInfo {
    return getItem(STORAGE_KEYS.PANCHANG, INITIAL_PANCHANG);
  }

  // --- REAL-TIME FIRESTORE ON-SNAPSHOT SUBSCRIBERS ---
  static subscribeToNews(callback: (articles: NewsArticle[]) => void): () => void {
    return FirestoreSyncService.subscribeToArticles(callback);
  }

  static subscribeToSettings(callback: (settings: WebsiteSettings) => void): () => void {
    return FirestoreSyncService.subscribeToSettings(callback);
  }

  static subscribeToCategories(callback: (categories: Category[]) => void): () => void {
    return FirestoreSyncService.subscribeToCategories(callback);
  }

  static subscribeToAdvertisements(callback: (ads: Advertisement[]) => void): () => void {
    return FirestoreSyncService.subscribeToAdvertisements(callback);
  }

  static subscribeToReporters(callback: (reporters: Reporter[]) => void): () => void {
    return FirestoreSyncService.subscribeToReporters(callback);
  }

  static subscribeToApplications(callback: (apps: MemberApplication[]) => void): () => void {
    return FirestoreSyncService.subscribeToApplications(callback);
  }

  static subscribeToJoiningLetters(callback: (letters: JoiningLetter[]) => void): () => void {
    return FirestoreSyncService.subscribeToJoiningLetters(callback);
  }
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  NewsService.init();
}
