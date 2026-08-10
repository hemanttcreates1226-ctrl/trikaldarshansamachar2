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
  PANCHANG: 'tds_panchang_v1'
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

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('tds_data_updated'));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

export class NewsService {
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
      if (filters.status) {
        articles = articles.filter(a => a.status === filters.status);
      } else {
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
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query) ||
          a.tags.some(t => t.toLowerCase().includes(query)) ||
          a.authorName.toLowerCase().includes(query)
        );
      }
    }

    articles.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

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
      setItem(STORAGE_KEYS.NEWS, articles);
      return found;
    }
    return null;
  }

  static incrementViews(id: string): void {
    const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const found = articles.find(a => a.id === id || a.slug === id);
    if (found) {
      found.views = (found.views || 0) + 1;
      setItem(STORAGE_KEYS.NEWS, articles);
    }
  }

  static saveArticle(articleData: Partial<NewsArticle>): NewsArticle {
    const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const now = new Date().toISOString();

    if (articleData.id) {
      const index = articles.findIndex(a => a.id === articleData.id);
      if (index !== -1) {
        const updated = {
          ...articles[index],
          ...articleData,
          updatedDate: now
        } as NewsArticle;
        articles[index] = updated;
        setItem(STORAGE_KEYS.NEWS, articles);
        return updated;
      }
    }

    const slug = articleData.title
      ? articleData.title.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, '-').replace(/^-+|-+$/g, '')
      : `news-${Date.now()}`;

    const newArticle: NewsArticle = {
      id: `news-${Date.now()}`,
      title: articleData.title || 'शीर्षक रहित समाचार',
      subtitle: articleData.subtitle || '',
      content: articleData.content || '',
      summary: articleData.summary || articleData.content?.slice(0, 150) || '',
      featuredImage: articleData.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
      categorySlug: articleData.categorySlug || 'latest-news',
      categoryName: articleData.categoryName || 'ताज़ा खबर',
      stateId: articleData.stateId,
      stateName: articleData.stateName,
      districtId: articleData.districtId,
      districtName: articleData.districtName,
      cityName: articleData.cityName,
      reporterId: articleData.reporterId,
      reporterName: articleData.reporterName,
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

    articles.unshift(newArticle);
    setItem(STORAGE_KEYS.NEWS, articles);
    return newArticle;
  }

  static deleteArticle(id: string): void {
    const articles: NewsArticle[] = getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const filtered = articles.filter(a => a.id !== id);
    setItem(STORAGE_KEYS.NEWS, filtered);
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
    if (category.id) {
      const idx = categories.findIndex(c => c.id === category.id);
      if (idx !== -1) {
        categories[idx] = { ...categories[idx], ...category };
        setItem(STORAGE_KEYS.CATEGORIES, categories);
        return categories[idx];
      }
    }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      nameHindi: category.nameHindi || 'नई श्रेणी',
      nameEnglish: category.nameEnglish || 'New Category',
      slug: category.slug || `cat-${Date.now()}`,
      sortOrder: category.sortOrder || categories.length + 1,
      isHidden: false
    };
    categories.push(newCat);
    setItem(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  }

  static deleteCategory(id: string): void {
    const categories: Category[] = getItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setItem(STORAGE_KEYS.CATEGORIES, categories.filter(c => c.id !== id));
  }

  // --- LOCATIONS ---
  static getStates(): State[] {
    return getItem(STORAGE_KEYS.STATES, INITIAL_STATES);
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
    if (district.id) {
      const idx = districts.findIndex(d => d.id === district.id);
      if (idx !== -1) {
        districts[idx] = { ...districts[idx], ...district };
        setItem(STORAGE_KEYS.DISTRICTS, districts);
        return districts[idx];
      }
    }
    const newDistrict: District = {
      id: `dt-${Date.now()}`,
      stateId: district.stateId || 'st-mp',
      nameHindi: district.nameHindi || 'नया जिला',
      nameEnglish: district.nameEnglish || 'New District',
      slug: district.slug || `district-${Date.now()}`,
      isEnabled: true
    };
    districts.push(newDistrict);
    setItem(STORAGE_KEYS.DISTRICTS, districts);
    return newDistrict;
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
    if (reporter.id) {
      const idx = reporters.findIndex(r => r.id === reporter.id);
      if (idx !== -1) {
        reporters[idx] = { ...reporters[idx], ...reporter };
        setItem(STORAGE_KEYS.REPORTERS, reporters);
        return reporters[idx];
      }
    }
    const newRep: Reporter = {
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
    reporters.push(newRep);
    setItem(STORAGE_KEYS.REPORTERS, reporters);
    return newRep;
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
    return app;
  }

  // --- ID CARDS & JOINING LETTERS ---
  static getIDCards(): IDCard[] {
    return getItem(STORAGE_KEYS.ID_CARDS, INITIAL_ID_CARDS);
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
    return newCard;
  }

  static getJoiningLetters(): JoiningLetter[] {
    return getItem(STORAGE_KEYS.JOINING_LETTERS, INITIAL_JOINING_LETTERS);
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
    if (adData.id) {
      const idx = ads.findIndex(a => a.id === adData.id);
      if (idx !== -1) {
        ads[idx] = { ...ads[idx], ...adData };
        setItem(STORAGE_KEYS.ADVERTISEMENTS, ads);
        return ads[idx];
      }
    }

    const newAd: Advertisement = {
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

    ads.push(newAd);
    setItem(STORAGE_KEYS.ADVERTISEMENTS, ads);
    return newAd;
  }

  static deleteAdvertisement(id: string): void {
    const ads: Advertisement[] = getItem(STORAGE_KEYS.ADVERTISEMENTS, INITIAL_ADVERTISEMENTS);
    setItem(STORAGE_KEYS.ADVERTISEMENTS, ads.filter(a => a.id !== id));
  }

  static getSocialLinks(): SocialLink[] {
    return getItem(STORAGE_KEYS.SOCIAL_LINKS, INITIAL_SOCIAL_LINKS);
  }

  static saveSocialLinks(links: SocialLink[]): void {
    setItem(STORAGE_KEYS.SOCIAL_LINKS, links);
  }

  // --- WEBSITE SETTINGS & PANCHANG ---
  static getSettings(): WebsiteSettings {
    const saved = getItem<WebsiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const merged = { ...INITIAL_SETTINGS, ...saved };
    // Always enforce default website logo to prevent stale local storage base64 data from overriding the official logo
    merged.logoImageUrl = INITIAL_SETTINGS.logoImageUrl;
    return merged;
  }

  static updateSettings(settings: Partial<WebsiteSettings>): WebsiteSettings {
    return this.saveSettings(settings);
  }

  static saveSettings(settings: Partial<WebsiteSettings>): WebsiteSettings {
    const current = getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const updated = { ...current, ...settings };
    setItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  static getPanchang(): PanchangInfo {
    return getItem(STORAGE_KEYS.PANCHANG, INITIAL_PANCHANG);
  }
}
