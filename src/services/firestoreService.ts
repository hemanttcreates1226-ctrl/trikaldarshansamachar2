import {
  collection,
  doc,
  setDoc,
  getDocFromServer,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  NewsArticle,
  Category,
  State,
  District,
  Reporter,
  MemberApplication,
  Advertisement,
  WebsiteSettings
} from '../types/news';
import {
  INITIAL_NEWS,
  INITIAL_CATEGORIES,
  INITIAL_STATES,
  INITIAL_DISTRICTS,
  INITIAL_REPORTERS,
  INITIAL_ADVERTISEMENTS,
  INITIAL_SETTINGS
} from '../data/initialData';

export class FirestoreSyncService {
  private static isInitialized = false;
  private static unsubscribers: Unsubscribe[] = [];

  // Active in-memory subscribers for instant component notification
  private static articleSubscribers: Set<(articles: NewsArticle[]) => void> = new Set();
  private static settingsSubscribers: Set<(settings: WebsiteSettings) => void> = new Set();
  private static categorySubscribers: Set<(categories: Category[]) => void> = new Set();

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

    // Test connection asynchronously
    this.testConnection();

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
            articles.push(data);
          });

          // Sort by publishDate descending (newest articles first)
          articles.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

          // Save to local storage for immediate offline / cold-start fallback
          localStorage.setItem('tds_news_articles_v1', JSON.stringify(articles));
          localStorage.setItem('tds_last_sync_timestamp', String(Date.now()));

          // Notify direct subscribers
          this.articleSubscribers.forEach((cb) => {
            try { cb(articles); } catch (e) { console.error(e); }
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
              try { cb(data); } catch (e) { console.error(e); }
            });

            onDataUpdated('firestore_settings');
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot settings subscription notice:', error.message);
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
            snapshot.forEach((d) => categories.push(d.data() as Category));
            categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            localStorage.setItem('tds_categories_v1', JSON.stringify(categories));
            
            this.categorySubscribers.forEach((cb) => {
              try { cb(categories); } catch (e) { console.error(e); }
            });

            onDataUpdated('firestore_categories');
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot categories subscription notice:', error.message);
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
            snapshot.forEach((d) => ads.push(d.data() as Advertisement));
            localStorage.setItem('tds_advertisements_v1', JSON.stringify(ads));
            onDataUpdated('firestore_advertisements');
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot ads notice:', error.message);
        }
      );
      this.unsubscribers.push(unsubAds);

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

  // --- SEED INITIAL CLOUD DATA ---
  static async seedInitialCloudData(): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Seed News
      for (const article of INITIAL_NEWS) {
        const articleRef = doc(db, 'news', article.id);
        batch.set(articleRef, article, { merge: true });
      }

      // Seed Settings
      const settingsRef = doc(db, 'settings', 'main');
      batch.set(settingsRef, INITIAL_SETTINGS, { merge: true });

      // Seed Categories
      for (const cat of INITIAL_CATEGORIES) {
        const catRef = doc(db, 'categories', cat.id);
        batch.set(catRef, cat, { merge: true });
      }

      // Seed States
      for (const st of INITIAL_STATES) {
        const stRef = doc(db, 'states', st.id);
        batch.set(stRef, st, { merge: true });
      }

      // Seed Districts
      for (const dt of INITIAL_DISTRICTS) {
        const dtRef = doc(db, 'districts', dt.id);
        batch.set(dtRef, dt, { merge: true });
      }

      // Seed Advertisements
      for (const ad of INITIAL_ADVERTISEMENTS) {
        const adRef = doc(db, 'advertisements', ad.id);
        batch.set(adRef, ad, { merge: true });
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
      await setDoc(docRef, article, { merge: true });
    } catch (err) {
      console.warn('Firestore saveArticle error:', err);
    }
  }

  static async deleteArticle(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'news', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteArticle error:', err);
    }
  }

  // --- SETTINGS CLOUD OPERATIONS ---
  static async saveSettings(settings: WebsiteSettings): Promise<void> {
    try {
      const docRef = doc(db, 'settings', 'main');
      await setDoc(docRef, settings, { merge: true });
    } catch (err) {
      console.warn('Firestore saveSettings error:', err);
    }
  }

  // --- CATEGORIES CLOUD OPERATIONS ---
  static async saveCategory(category: Category): Promise<void> {
    try {
      const docRef = doc(db, 'categories', category.id);
      await setDoc(docRef, category, { merge: true });
    } catch (err) {
      console.warn('Firestore saveCategory error:', err);
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'categories', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteCategory error:', err);
    }
  }

  // --- APPLICATIONS & REPORTERS ---
  static async saveApplication(app: MemberApplication): Promise<void> {
    try {
      const docRef = doc(db, 'member_applications', app.id);
      await setDoc(docRef, app, { merge: true });
    } catch (err) {
      console.warn('Firestore saveApplication error:', err);
    }
  }

  static async saveReporter(reporter: Reporter): Promise<void> {
    try {
      const docRef = doc(db, 'reporters', reporter.id);
      await setDoc(docRef, reporter, { merge: true });
    } catch (err) {
      console.warn('Firestore saveReporter error:', err);
    }
  }

  // --- ADVERTISEMENTS ---
  static async saveAdvertisement(ad: Advertisement): Promise<void> {
    try {
      const docRef = doc(db, 'advertisements', ad.id);
      await setDoc(docRef, ad, { merge: true });
    } catch (err) {
      console.warn('Firestore saveAdvertisement error:', err);
    }
  }

  static async deleteAdvertisement(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'advertisements', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteAdvertisement error:', err);
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
