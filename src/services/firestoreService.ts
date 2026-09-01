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
import { db, auth } from '../lib/firebase';
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
import { storageSet, STORAGE_KEYS } from '../lib/storageManager';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const rawMsg = error instanceof Error ? error.message : String(error);
  
  // Non-fatal stream timeout or idle stream cleanup by gRPC/WebChannel
  if (
    rawMsg.includes('CANCELLED') ||
    rawMsg.includes('idle stream') ||
    rawMsg.includes('the client is offline')
  ) {
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: rawMsg,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error Info: ', JSON.stringify(errInfo));
}

/**
 * Deeply strips undefined values, ensures pure serializable Firestore objects,
 * and caps excessively large media strings to keep documents strictly within
 * Firestore's 1MB limit.
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
        // Prevent storing huge uncompressed media arrays that breach document quota
        if (key === 'galleryImages' && Array.isArray(val) && val.length > 5) {
          cleaned[key] = val.slice(0, 5).map(item => cleanForFirestore(item));
        } else {
          cleaned[key] = cleanForFirestore(val);
        }
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
  private static idCardSubscribers: Set<(cards: IDCard[]) => void> = new Set();
  private static stateSubscribers: Set<(states: State[]) => void> = new Set();
  private static districtSubscribers: Set<(districts: District[]) => void> = new Set();
  private static socialLinkSubscribers: Set<(links: SocialLink[]) => void> = new Set();
  private static panchangSubscribers: Set<(panchang: PanchangInfo) => void> = new Set();

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

          // Update local and in-memory cache safely
          storageSet(STORAGE_KEYS.NEWS, articles, false, 'firestore_news');
          try { localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(Date.now())); } catch {}

          // Notify direct subscribers
          this.articleSubscribers.forEach((cb) => {
            try { cb(articles); } catch (e) { console.error('Article subscriber error:', e); }
          });

          // Dispatch global live event
          onDataUpdated('firestore_news');
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'news');
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
            storageSet(STORAGE_KEYS.SETTINGS, data, false, 'firestore_settings');
            
            this.settingsSubscribers.forEach((cb) => {
              try { cb(data); } catch (e) { console.error('Settings subscriber error:', e); }
            });

            onDataUpdated('firestore_settings');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'settings/main');
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
            storageSet(STORAGE_KEYS.CATEGORIES, categories, false, 'firestore_categories');
            
            this.categorySubscribers.forEach((cb) => {
              try { cb(categories); } catch (e) { console.error('Category subscriber error:', e); }
            });

            onDataUpdated('firestore_categories');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'categories');
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
            storageSet(STORAGE_KEYS.ADVERTISEMENTS, ads, false, 'firestore_advertisements');
            
            this.advertisementSubscribers.forEach((cb) => {
              try { cb(ads); } catch (e) { console.error('Ads subscriber error:', e); }
            });

            onDataUpdated('firestore_advertisements');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'advertisements');
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
            storageSet(STORAGE_KEYS.REPORTERS, reps, false, 'firestore_reporters');
            
            this.reporterSubscribers.forEach((cb) => {
              try { cb(reps); } catch (e) { console.error('Reporter subscriber error:', e); }
            });

            onDataUpdated('firestore_reporters');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'reporters');
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
            storageSet(STORAGE_KEYS.APPLICATIONS, apps, false, 'firestore_applications');
            
            this.applicationSubscribers.forEach((cb) => {
              try { cb(apps); } catch (e) { console.error('Application subscriber error:', e); }
            });

            onDataUpdated('firestore_applications');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'member_applications');
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
            storageSet(STORAGE_KEYS.JOINING_LETTERS, letters, false, 'firestore_joining_letters');
            
            this.letterSubscribers.forEach((cb) => {
              try { cb(letters); } catch (e) { console.error('Letters subscriber error:', e); }
            });

            onDataUpdated('firestore_joining_letters');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'joining_letters');
        }
      );
      this.unsubscribers.push(unsubLetters);

      // 8. Listen to ID Cards in Real-time (onSnapshot)
      const idCardsCol = collection(db, 'id_cards');
      const unsubIdCards = onSnapshot(
        idCardsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cards: IDCard[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as IDCard;
              if (data && data.id) cards.push(data);
            });
            storageSet(STORAGE_KEYS.ID_CARDS, cards, false, 'firestore_id_cards');
            
            this.idCardSubscribers.forEach((cb) => {
              try { cb(cards); } catch (e) { console.error('ID Card subscriber error:', e); }
            });

            onDataUpdated('firestore_id_cards');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'id_cards');
        }
      );
      this.unsubscribers.push(unsubIdCards);

      // 9. Listen to States in Real-time (onSnapshot)
      const statesCol = collection(db, 'states');
      const unsubStates = onSnapshot(
        statesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const states: State[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as State;
              if (data && data.id) states.push(data);
            });
            storageSet(STORAGE_KEYS.STATES, states, false, 'firestore_states');
            
            this.stateSubscribers.forEach((cb) => {
              try { cb(states); } catch (e) { console.error('State subscriber error:', e); }
            });

            onDataUpdated('firestore_states');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'states');
        }
      );
      this.unsubscribers.push(unsubStates);

      // 10. Listen to Districts in Real-time (onSnapshot)
      const districtsCol = collection(db, 'districts');
      const unsubDistricts = onSnapshot(
        districtsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const districts: District[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as District;
              if (data && data.id) districts.push(data);
            });
            storageSet(STORAGE_KEYS.DISTRICTS, districts, false, 'firestore_districts');
            
            this.districtSubscribers.forEach((cb) => {
              try { cb(districts); } catch (e) { console.error('District subscriber error:', e); }
            });

            onDataUpdated('firestore_districts');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'districts');
        }
      );
      this.unsubscribers.push(unsubDistricts);

      // 11. Listen to Social Links in Real-time (onSnapshot)
      const socialDoc = doc(db, 'settings', 'social');
      const unsubSocial = onSnapshot(
        socialDoc,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && Array.isArray(data.links)) {
              storageSet(STORAGE_KEYS.SOCIAL_LINKS, data.links, false, 'firestore_social_links');
              this.socialLinkSubscribers.forEach((cb) => {
                try { cb(data.links); } catch (e) { console.error('Social link subscriber error:', e); }
              });
              onDataUpdated('firestore_social_links');
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'settings/social');
        }
      );
      this.unsubscribers.push(unsubSocial);

      // 12. Listen to Panchang in Real-time (onSnapshot)
      const panchangDoc = doc(db, 'system', 'panchang');
      const unsubPanchang = onSnapshot(
        panchangDoc,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as PanchangInfo;
            if (data) {
              storageSet(STORAGE_KEYS.PANCHANG, data, false, 'firestore_panchang');
              this.panchangSubscribers.forEach((cb) => {
                try { cb(data); } catch (e) { console.error('Panchang subscriber error:', e); }
              });
              onDataUpdated('firestore_panchang');
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'system/panchang');
        }
      );
      this.unsubscribers.push(unsubPanchang);

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

  static subscribeToIdCards(callback: (cards: IDCard[]) => void): () => void {
    this.idCardSubscribers.add(callback);
    return () => {
      this.idCardSubscribers.delete(callback);
    };
  }

  static subscribeToStates(callback: (states: State[]) => void): () => void {
    this.stateSubscribers.add(callback);
    return () => {
      this.stateSubscribers.delete(callback);
    };
  }

  static subscribeToDistricts(callback: (districts: District[]) => void): () => void {
    this.districtSubscribers.add(callback);
    return () => {
      this.districtSubscribers.delete(callback);
    };
  }

  static subscribeToSocialLinks(callback: (links: SocialLink[]) => void): () => void {
    this.socialLinkSubscribers.add(callback);
    return () => {
      this.socialLinkSubscribers.delete(callback);
    };
  }

  static subscribeToPanchang(callback: (panchang: PanchangInfo) => void): () => void {
    this.panchangSubscribers.add(callback);
    return () => {
      this.panchangSubscribers.delete(callback);
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
      handleFirestoreError(err, OperationType.WRITE, `news/${article.id}`);
    }
  }

  static async deleteArticle(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'news', id);
      await deleteDoc(docRef);
      console.log(`[Firestore] Article deleted from Cloud Firestore: ${id}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `news/${id}`);
    }
  }

  // --- SETTINGS CLOUD OPERATIONS ---
  static async saveSettings(settings: WebsiteSettings): Promise<void> {
    try {
      const docRef = doc(db, 'settings', 'main');
      const cleaned = cleanForFirestore(settings);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/main');
    }
  }

  // --- CATEGORIES CLOUD OPERATIONS ---
  static async saveCategory(category: Category): Promise<void> {
    try {
      const docRef = doc(db, 'categories', category.id);
      const cleaned = cleanForFirestore(category);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`);
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'categories', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  }

  // --- STATES & DISTRICTS ---
  static async saveState(state: State): Promise<void> {
    try {
      const docRef = doc(db, 'states', state.id);
      const cleaned = cleanForFirestore(state);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `states/${state.id}`);
    }
  }

  static async deleteState(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'states', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `states/${id}`);
    }
  }

  static async saveDistrict(district: District): Promise<void> {
    try {
      const docRef = doc(db, 'districts', district.id);
      const cleaned = cleanForFirestore(district);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `districts/${district.id}`);
    }
  }

  static async deleteDistrict(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'districts', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `districts/${id}`);
    }
  }

  // --- ID CARDS ---
  static async saveIdCard(card: IDCard): Promise<void> {
    try {
      const docRef = doc(db, 'id_cards', card.id);
      const cleaned = cleanForFirestore(card);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `id_cards/${card.id}`);
    }
  }

  static async deleteIdCard(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'id_cards', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `id_cards/${id}`);
    }
  }

  // --- SOCIAL LINKS ---
  static async saveSocialLinks(links: SocialLink[]): Promise<void> {
    try {
      const docRef = doc(db, 'settings', 'social');
      const cleaned = cleanForFirestore({ links, updatedAt: new Date().toISOString() });
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/social');
    }
  }

  // --- PANCHANG ---
  static async savePanchang(panchang: PanchangInfo): Promise<void> {
    try {
      const docRef = doc(db, 'system', 'panchang');
      const cleaned = cleanForFirestore(panchang);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'system/panchang');
    }
  }

  // --- APPLICATIONS & REPORTERS ---
  static async saveApplication(app: MemberApplication): Promise<void> {
    try {
      const docRef = doc(db, 'member_applications', app.id);
      const cleaned = cleanForFirestore(app);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `member_applications/${app.id}`);
    }
  }

  static async deleteApplication(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'member_applications', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `member_applications/${id}`);
    }
  }

  static async saveReporter(reporter: Reporter): Promise<void> {
    try {
      const docRef = doc(db, 'reporters', reporter.id);
      const cleaned = cleanForFirestore(reporter);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reporters/${reporter.id}`);
    }
  }

  static async deleteReporter(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'reporters', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reporters/${id}`);
    }
  }

  // --- JOINING LETTERS ---
  static async saveJoiningLetter(letter: JoiningLetter): Promise<void> {
    try {
      const docRef = doc(db, 'joining_letters', letter.id);
      const cleaned = cleanForFirestore(letter);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `joining_letters/${letter.id}`);
    }
  }

  static async deleteJoiningLetter(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'joining_letters', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `joining_letters/${id}`);
    }
  }

  // --- ADVERTISEMENTS ---
  static async saveAdvertisement(ad: Advertisement): Promise<void> {
    try {
      const docRef = doc(db, 'advertisements', ad.id);
      const cleaned = cleanForFirestore(ad);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `advertisements/${ad.id}`);
    }
  }

  static async deleteAdvertisement(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'advertisements', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `advertisements/${id}`);
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
