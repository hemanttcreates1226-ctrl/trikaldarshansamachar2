import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDocFromServer,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  PanchangInfo
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

/**
 * Deeply strips undefined values and ensures pure serializable Firestore objects.
 * Firestore strictly rejects documents containing `undefined` properties.
 */
export function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => cleanForFirestore(item));
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = cleanForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
}

export class FirestoreSyncService {
  private static isInitialized = false;
  private static unsubscribers: Unsubscribe[] = [];

  // Active in-memory subscribers for instant component notification
  private static articleSubscribers: Set<(articles: NewsArticle[]) => void> = new Set();
  private static settingsSubscribers: Set<(settings: WebsiteSettings) => void> = new Set();
  private static categorySubscribers: Set<(categories: Category[]) => void> = new Set();
  private static advertisementSubscribers: Set<(ads: Advertisement[]) => void> = new Set();
  private static reporterSubscribers: Set<(reporters: Reporter[]) => void> = new Set();
  private static applicationSubscribers: Set<(apps: MemberApplication[]) => void> = new Set();
  private static letterSubscribers: Set<(letters: JoiningLetter[]) => void> = new Set();

  static async testConnection(): Promise<boolean> {
    try {
      await getDocFromServer(doc(db, 'system', 'connection'));
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firestore offline notice. Using cached storage until connection re-establishes.');
      }
      return false;
    }
  }

  static init(onDataUpdated: (source: string) => void): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    try {
      // 1. Listen to News collection in Real-time (onSnapshot)
      const newsCol = collection(db, 'news');
      const unsubNews = onSnapshot(
        newsCol,
        (snapshot) => {
          if (snapshot.empty) {
            // First time setup - seed initial news data into Firestore
            this.seedInitialCloudData();
            return;
          }

          const articles: NewsArticle[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as NewsArticle;
            if (data && data.id) {
              articles.push(data);
            }
          });

          // Sort by publishDate descending (newest articles first)
          articles.sort((a, b) => {
            const dateA = new Date(a.publishDate || a.updatedDate || 0).getTime();
            const dateB = new Date(b.publishDate || b.updatedDate || 0).getTime();
            return dateB - dateA;
          });

          // Update local cache
          localStorage.setItem('tds_news_articles_v1', JSON.stringify(articles));
          localStorage.setItem('tds_last_sync_timestamp', String(Date.now()));

          // Notify direct subscribers
          this.articleSubscribers.forEach((cb) => {
            try { cb(articles); } catch (e) { console.error('Article subscriber error:', e); }
          });

          // Dispatch global live event
          onDataUpdated('firestore_news');
        },
        (error) => {
          console.warn('Firestore onSnapshot news subscription notice:', error.message);
        }
      );
      this.unsubscribers.push(unsubNews);

      // 2. Listen to Settings in Real-time (onSnapshot)
      const settingsDoc = doc(db, 'settings', 'main');
      const unsubSettings = onSnapshot(
        settingsDoc,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as WebsiteSettings;
            localStorage.setItem('tds_settings_v1', JSON.stringify(data));
            
            this.settingsSubscribers.forEach((cb) => {
              try { cb(data); } catch (e) { console.error('Settings subscriber error:', e); }
            });

            onDataUpdated('firestore_settings');
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot settings notice:', error.message);
        }
      );
      this.unsubscribers.push(unsubSettings);

      // 3. Listen to Categories in Real-time (onSnapshot)
      const categoriesCol = collection(db, 'categories');
      const unsubCategories = onSnapshot(
        categoriesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const categories: Category[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Category;
              if (data && data.id) categories.push(data);
            });
            categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            localStorage.setItem('tds_categories_v1', JSON.stringify(categories));
            
            this.categorySubscribers.forEach((cb) => {
              try { cb(categories); } catch (e) { console.error('Category subscriber error:', e); }
            });

            onDataUpdated('firestore_categories');
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot categories notice:', error.message);
        }
      );
      this.unsubscribers.push(unsubCategories);

      // 4. Listen to Advertisements in Real-time (onSnapshot)
      const adsCol = collection(db, 'advertisements');
      const unsubAds = onSnapshot(
        adsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const ads: Advertisement[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Advertisement;
              if (data && data.id) ads.push(data);
            });
            localStorage.setItem('tds_advertisements_v1', JSON.stringify(ads));
            
            this.advertisementSubscribers.forEach((cb) => {
              try { cb(ads); } catch (e) { console.error('Ads subscriber error:', e); }
            });

            onDataUpdated('firestore_advertisements');
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot ads notice:', error.message);
        }
      );
      this.unsubscribers.push(unsubAds);

      // 5. Listen to Reporters in Real-time (onSnapshot)
      const repCol = collection(db, 'reporters');
      const unsubRep = onSnapshot(
        repCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const reps: Reporter[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Reporter;
              if (data && data.id) reps.push(data);
            });
            localStorage.setItem('tds_reporters_v1', JSON.stringify(reps));
            
            this.reporterSubscribers.forEach((cb) => {
              try { cb(reps); } catch (e) { console.error('Reporter subscriber error:', e); }
            });

            onDataUpdated('firestore_reporters');
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot reporters notice:', error.message);
        }
      );
      this.unsubscribers.push(unsubRep);

      // 6. Listen to Member Applications in Real-time (onSnapshot)
      const appCol = collection(db, 'member_applications');
      const unsubApps = onSnapshot(
        appCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const apps: MemberApplication[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as MemberApplication;
              if (data && data.id) apps.push(data);
            });
            localStorage.setItem('tds_applications_v1', JSON.stringify(apps));
            
            this.applicationSubscribers.forEach((cb) => {
              try { cb(apps); } catch (e) { console.error('Application subscriber error:', e); }
            });

            onDataUpdated('firestore_applications');
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot applications notice:', error.message);
        }
      );
      this.unsubscribers.push(unsubApps);

      // 7. Listen to Joining Letters in Real-time (onSnapshot)
      const lettersCol = collection(db, 'joining_letters');
      const unsubLetters = onSnapshot(
        lettersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const letters: JoiningLetter[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as JoiningLetter;
              if (data && data.id) letters.push(data);
            });
            localStorage.setItem('tds_joining_letters_v1', JSON.stringify(letters));
            
            this.letterSubscribers.forEach((cb) => {
              try { cb(letters); } catch (e) { console.error('Letters subscriber error:', e); }
            });

            onDataUpdated('firestore_joining_letters');
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot joining letters notice:', error.message);
        }
      );
      this.unsubscribers.push(unsubLetters);

    } catch (err) {
      console.warn('Firestore real-time sync failed to initialize:', err);
    }
  }

  // --- SUBSCRIBER REGISTRATION ---
  static subscribeToArticles(callback: (articles: NewsArticle[]) => void): () => void {
    this.articleSubscribers.add(callback);
    return () => {
      this.articleSubscribers.delete(callback);
    };
  }

  static subscribeToSettings(callback: (settings: WebsiteSettings) => void): () => void {
    this.settingsSubscribers.add(callback);
    return () => {
      this.settingsSubscribers.delete(callback);
    };
  }

  static subscribeToCategories(callback: (categories: Category[]) => void): () => void {
    this.categorySubscribers.add(callback);
    return () => {
      this.categorySubscribers.delete(callback);
    };
  }

  static subscribeToAdvertisements(callback: (ads: Advertisement[]) => void): () => void {
    this.advertisementSubscribers.add(callback);
    return () => {
      this.advertisementSubscribers.delete(callback);
    };
  }

  static subscribeToReporters(callback: (reporters: Reporter[]) => void): () => void {
    this.reporterSubscribers.add(callback);
    return () => {
      this.reporterSubscribers.delete(callback);
    };
  }

  static subscribeToApplications(callback: (apps: MemberApplication[]) => void): () => void {
    this.applicationSubscribers.add(callback);
    return () => {
      this.applicationSubscribers.delete(callback);
    };
  }

  static subscribeToJoiningLetters(callback: (letters: JoiningLetter[]) => void): () => void {
    this.letterSubscribers.add(callback);
    return () => {
      this.letterSubscribers.delete(callback);
    };
  }

  // --- SEED INITIAL CLOUD DATA ---
  static async seedInitialCloudData(): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Seed News
      for (const article of INITIAL_NEWS) {
        const articleRef = doc(db, 'news', article.id);
        batch.set(articleRef, cleanForFirestore(article), { merge: true });
      }

      // Seed Settings
      const settingsRef = doc(db, 'settings', 'main');
      batch.set(settingsRef, cleanForFirestore(INITIAL_SETTINGS), { merge: true });

      // Seed Categories
      for (const cat of INITIAL_CATEGORIES) {
        const catRef = doc(db, 'categories', cat.id);
        batch.set(catRef, cleanForFirestore(cat), { merge: true });
      }

      // Seed States
      for (const st of INITIAL_STATES) {
        const stRef = doc(db, 'states', st.id);
        batch.set(stRef, cleanForFirestore(st), { merge: true });
      }

      // Seed Districts
      for (const dt of INITIAL_DISTRICTS) {
        const dtRef = doc(db, 'districts', dt.id);
        batch.set(dtRef, cleanForFirestore(dt), { merge: true });
      }

      // Seed Advertisements
      for (const ad of INITIAL_ADVERTISEMENTS) {
        const adRef = doc(db, 'advertisements', ad.id);
        batch.set(adRef, cleanForFirestore(ad), { merge: true });
      }

      // Seed Reporters
      for (const rep of INITIAL_REPORTERS) {
        const repRef = doc(db, 'reporters', rep.id);
        batch.set(repRef, cleanForFirestore(rep), { merge: true });
      }

      // Seed Applications
      for (const app of INITIAL_APPLICATIONS) {
        const appRef = doc(db, 'member_applications', app.id);
        batch.set(appRef, cleanForFirestore(app), { merge: true });
      }

      // Seed Joining Letters
      for (const jl of INITIAL_JOINING_LETTERS) {
        const jlRef = doc(db, 'joining_letters', jl.id);
        batch.set(jlRef, cleanForFirestore(jl), { merge: true });
      }

      await batch.commit();
      console.log('Firebase Cloud Firestore successfully seeded with initial news data.');
    } catch (err) {
      console.warn('Could not seed initial data to Firestore:', err);
    }
  }

  // --- ARTICLE CLOUD OPERATIONS ---
  static async saveArticle(article: NewsArticle): Promise<void> {
    try {
      const docRef = doc(db, 'news', article.id);
      const cleaned = cleanForFirestore(article);
      await setDoc(docRef, cleaned, { merge: true });
      console.log(`[Firestore] Article saved successfully: ${article.id}`);
    } catch (err) {
      console.error('[Firestore] Error saving article to Cloud Firestore:', err);
    }
  }

  static async deleteArticle(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'news', id);
      await deleteDoc(docRef);
      console.log(`[Firestore] Article deleted from Cloud Firestore: ${id}`);
    } catch (err) {
      console.error('[Firestore] Error deleting article from Cloud Firestore:', err);
    }
  }

  // --- SETTINGS CLOUD OPERATIONS ---
  static async saveSettings(settings: WebsiteSettings): Promise<void> {
    try {
      const docRef = doc(db, 'settings', 'main');
      const cleaned = cleanForFirestore(settings);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error saving settings:', err);
    }
  }

  // --- CATEGORIES CLOUD OPERATIONS ---
  static async saveCategory(category: Category): Promise<void> {
    try {
      const docRef = doc(db, 'categories', category.id);
      const cleaned = cleanForFirestore(category);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error saving category:', err);
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'categories', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('[Firestore] Error deleting category:', err);
    }
  }

  // --- STATES & DISTRICTS ---
  static async saveState(state: State): Promise<void> {
    try {
      const docRef = doc(db, 'states', state.id);
      const cleaned = cleanForFirestore(state);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error saving state:', err);
    }
  }

  static async saveDistrict(district: District): Promise<void> {
    try {
      const docRef = doc(db, 'districts', district.id);
      const cleaned = cleanForFirestore(district);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error saving district:', err);
    }
  }

  static async deleteDistrict(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'districts', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('[Firestore] Error deleting district:', err);
    }
  }

  // --- APPLICATIONS & REPORTERS ---
  static async saveApplication(app: MemberApplication): Promise<void> {
    try {
      const docRef = doc(db, 'member_applications', app.id);
      const cleaned = cleanForFirestore(app);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error saving application:', err);
    }
  }

  static async deleteApplication(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'member_applications', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('[Firestore] Error deleting application:', err);
    }
  }

  static async saveReporter(reporter: Reporter): Promise<void> {
    try {
      const docRef = doc(db, 'reporters', reporter.id);
      const cleaned = cleanForFirestore(reporter);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error saving reporter:', err);
    }
  }

  static async deleteReporter(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'reporters', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('[Firestore] Error deleting reporter:', err);
    }
  }

  // --- JOINING LETTERS ---
  static async saveJoiningLetter(letter: JoiningLetter): Promise<void> {
    try {
      const docRef = doc(db, 'joining_letters', letter.id);
      const cleaned = cleanForFirestore(letter);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error saving joining letter:', err);
    }
  }

  static async deleteJoiningLetter(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'joining_letters', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('[Firestore] Error deleting joining letter:', err);
    }
  }

  // --- ADVERTISEMENTS ---
  static async saveAdvertisement(ad: Advertisement): Promise<void> {
    try {
      const docRef = doc(db, 'advertisements', ad.id);
      const cleaned = cleanForFirestore(ad);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error saving advertisement:', err);
    }
  }

  static async deleteAdvertisement(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'advertisements', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('[Firestore] Error deleting advertisement:', err);
    }
  }

  // Cleanup listeners
  static cleanup(): void {
    this.unsubscribers.forEach((unsub) => {
      try { unsub(); } catch { /* ignore */ }
    });
    this.unsubscribers = [];
    this.isInitialized = false;
  }
}
