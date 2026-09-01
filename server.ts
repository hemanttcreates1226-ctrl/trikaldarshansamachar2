import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import firebaseConfigJson from "./firebase-applet-config.json";

// Silence non-fatal gRPC stream idle disconnections
setLogLevel("error");

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
} from "./src/data/initialData";
import { articleMatchesKey } from "./src/lib/slugHelper";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "database.json");

// Initialize Firebase App & Firestore on the Server
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfigJson) : getApp();
const serverDbId = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== "(default)"
  ? firebaseConfigJson.firestoreDatabaseId
  : undefined;

const firestoreDb = (() => {
  try {
    return initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true,
    }, serverDbId);
  } catch {
    return serverDbId ? getFirestore(firebaseApp, serverDbId) : getFirestore(firebaseApp);
  }
})();

interface ServerDatabase {
  news: any[];
  categories: any[];
  states: any[];
  districts: any[];
  reporters: any[];
  applications: any[];
  idCards: any[];
  joiningLetters: any[];
  advertisements: any[];
  socialLinks: any[];
  settings: any;
  panchang: any;
  lastUpdated: number;
}

function getDefaultDatabase(): ServerDatabase {
  return {
    news: INITIAL_NEWS,
    categories: INITIAL_CATEGORIES,
    states: INITIAL_STATES,
    districts: INITIAL_DISTRICTS,
    reporters: INITIAL_REPORTERS,
    applications: INITIAL_APPLICATIONS,
    idCards: INITIAL_ID_CARDS,
    joiningLetters: INITIAL_JOINING_LETTERS,
    advertisements: INITIAL_ADVERTISEMENTS,
    socialLinks: INITIAL_SOCIAL_LINKS,
    settings: INITIAL_SETTINGS,
    panchang: INITIAL_PANCHANG,
    lastUpdated: Date.now()
  };
}

let inMemoryDb: ServerDatabase = getDefaultDatabase();

function loadDatabaseFromDisk(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        inMemoryDb = {
          ...getDefaultDatabase(),
          ...parsed,
          news: Array.isArray(parsed.news) ? parsed.news : INITIAL_NEWS,
          categories: Array.isArray(parsed.categories) ? parsed.categories : INITIAL_CATEGORIES,
          states: Array.isArray(parsed.states) ? parsed.states : INITIAL_STATES,
          districts: Array.isArray(parsed.districts) ? parsed.districts : INITIAL_DISTRICTS,
          reporters: Array.isArray(parsed.reporters) ? parsed.reporters : INITIAL_REPORTERS,
          applications: Array.isArray(parsed.applications) ? parsed.applications : INITIAL_APPLICATIONS,
          idCards: Array.isArray(parsed.idCards) ? parsed.idCards : INITIAL_ID_CARDS,
          joiningLetters: Array.isArray(parsed.joiningLetters) ? parsed.joiningLetters : INITIAL_JOINING_LETTERS,
          advertisements: Array.isArray(parsed.advertisements) ? parsed.advertisements : INITIAL_ADVERTISEMENTS,
          socialLinks: Array.isArray(parsed.socialLinks) ? parsed.socialLinks : INITIAL_SOCIAL_LINKS,
          settings: parsed.settings ? { ...INITIAL_SETTINGS, ...parsed.settings } : INITIAL_SETTINGS,
          panchang: parsed.panchang || INITIAL_PANCHANG,
          lastUpdated: parsed.lastUpdated || Date.now()
        };
        console.log(`[DB] Successfully loaded database from ${DB_FILE}`);
        return;
      }
    }
    saveDatabaseToDisk();
  } catch (err) {
    console.warn("[DB] Could not load database from disk, using memory fallback:", err);
  }
}

function saveDatabaseToDisk(): void {
  inMemoryDb.lastUpdated = Date.now();
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), "utf-8");
  } catch (err) {
    console.warn("[DB] Could not save database to disk:", err);
  }
}

// Set up background Firestore real-time synchronization for server
function initFirestoreSync(): void {
  try {
    const newsCol = collection(firestoreDb, "news");
    onSnapshot(newsCol, (snapshot) => {
      if (!snapshot.empty) {
        const cloudArticles: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) {
            cloudArticles.push(data);
          }
        });
        cloudArticles.sort((a, b) => {
          const dateA = new Date(a.publishDate || a.updatedDate || 0).getTime();
          const dateB = new Date(b.publishDate || b.updatedDate || 0).getTime();
          return dateB - dateA;
        });
        inMemoryDb.news = cloudArticles;
        saveDatabaseToDisk();
        console.log(`[Firestore Sync] Synchronized ${cloudArticles.length} articles into server memory`);
      }
    }, (err) => {
      console.warn("[Firestore Sync] Snapshot listener warning:", err.message);
    });
  } catch (err) {
    console.warn("[Firestore Sync] Could not initialize Firestore listener:", err);
  }
}

async function startServer() {
  loadDatabaseFromDisk();
  initFirestoreSync();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // --- API ENDPOINTS ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      appName: "Trikal Darshan Samachar",
      articlesCount: inMemoryDb.news.length,
      lastUpdated: inMemoryDb.lastUpdated,
      timestamp: new Date().toISOString()
    });
  });

  // Full Live Data Fetch
  app.get("/api/data", (req, res) => {
    res.json({
      success: true,
      lastUpdated: inMemoryDb.lastUpdated,
      data: inMemoryDb
    });
  });

  // Batch / Snapshot Sync
  app.post("/api/data/sync", (req, res) => {
    try {
      const body = req.body || {};
      if (body.news && Array.isArray(body.news)) inMemoryDb.news = body.news;
      if (body.categories && Array.isArray(body.categories)) inMemoryDb.categories = body.categories;
      if (body.states && Array.isArray(body.states)) inMemoryDb.states = body.states;
      if (body.districts && Array.isArray(body.districts)) inMemoryDb.districts = body.districts;
      if (body.reporters && Array.isArray(body.reporters)) inMemoryDb.reporters = body.reporters;
      if (body.applications && Array.isArray(body.applications)) inMemoryDb.applications = body.applications;
      if (body.idCards && Array.isArray(body.idCards)) inMemoryDb.idCards = body.idCards;
      if (body.joiningLetters && Array.isArray(body.joiningLetters)) inMemoryDb.joiningLetters = body.joiningLetters;
      if (body.advertisements && Array.isArray(body.advertisements)) inMemoryDb.advertisements = body.advertisements;
      if (body.socialLinks && Array.isArray(body.socialLinks)) inMemoryDb.socialLinks = body.socialLinks;
      if (body.settings && typeof body.settings === "object") inMemoryDb.settings = { ...inMemoryDb.settings, ...body.settings };
      if (body.panchang && typeof body.panchang === "object") inMemoryDb.panchang = body.panchang;

      saveDatabaseToDisk();
      res.json({ success: true, lastUpdated: inMemoryDb.lastUpdated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Sync failed" });
    }
  });

  // --- ARTICLES CRUD & IMAGE ENDPOINTS ---
  app.get("/api/articles", (req, res) => {
    res.json(inMemoryDb.news);
  });

  // Dedicated Binary Image Endpoint for WhatsApp / Social Previews & Client Rendering
  app.get(
    [
      "/img/:idOrSlug.jpg",
      "/img/:idOrSlug",
      "/thumbnail/:idOrSlug.jpg",
      "/thumbnail/:idOrSlug",
      "/api/articles/:idOrSlug/image",
      "/api/articles/:idOrSlug/image.jpg",
      "/api/articles/:idOrSlug/thumbnail.jpg"
    ],
    async (req, res) => {
      try {
        const { idOrSlug } = req.params;
        const cleanKey = (idOrSlug || "").replace(/\.(jpg|jpeg|png|webp)$/i, "").trim();
        const article = await findArticleAsync(cleanKey);
        const baseUrl = getBaseUrl(req);

        if (!article) {
          return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
        }

        const rawFeatured = article.featuredImage || article.image || article.imageUrl || article.thumbnail || (Array.isArray(article.galleryImages) && article.galleryImages[0]);
        if (!rawFeatured) {
          return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
        }

        const featured = String(rawFeatured).trim();

        // If Base64 Image (e.g. data:image/jpeg;base64,... or raw base64 data)
        if (
          featured.startsWith("data:") ||
          (!featured.startsWith("http://") && !featured.startsWith("https://") && !featured.startsWith("/"))
        ) {
          let mimeType = "image/jpeg";
          let base64Data = featured;

          const match = featured.match(/^data:([^;]+);base64,(.+)$/s);
          if (match) {
            mimeType = match[1] || "image/jpeg";
            base64Data = match[2];
          }

          try {
            const imageBuffer = Buffer.from(base64Data, "base64");
            if (imageBuffer && imageBuffer.length > 0) {
              res.set({
                "Content-Type": mimeType,
                "Content-Length": imageBuffer.length.toString(),
                "Cache-Control": "public, max-age=31536000, immutable",
                "Access-Control-Allow-Origin": "*",
                "Accept-Ranges": "bytes"
              });
              return res.status(200).send(imageBuffer);
            }
          } catch (e) {
            console.error("[Image Endpoint] Base64 decode error:", e);
          }
          return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
        }

        // If absolute HTTPS or HTTP URL (e.g. Unsplash, external storage)
        if (featured.startsWith("https://") || featured.startsWith("http://")) {
          return res.redirect(302, featured);
        }

        // If local relative asset path
        if (featured.startsWith("/")) {
          return res.redirect(302, `${baseUrl}${featured}`);
        }

        return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
      } catch (err) {
        console.error("[Image Endpoint Error]", err);
        return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
      }
    }
  );

  app.get("/api/articles/:idOrSlug", async (req, res) => {
    const { idOrSlug } = req.params;
    const found = await findArticleAsync(idOrSlug);
    if (found) {
      found.views = (found.views || 0) + 1;
      saveDatabaseToDisk();
      return res.json(found);
    }
    res.status(404).json({ error: "Article not found" });
  });

  app.post("/api/articles", (req, res) => {
    const article = req.body;
    if (!article) return res.status(400).json({ error: "Article data required" });

    const now = new Date().toISOString();
    const idx = inMemoryDb.news.findIndex((a: any) => a.id === article.id);
    if (idx !== -1) {
      inMemoryDb.news[idx] = { ...inMemoryDb.news[idx], ...article, updatedDate: now };
      saveDatabaseToDisk();
      return res.json(inMemoryDb.news[idx]);
    } else {
      const newArticle = {
        id: article.id || `news-${Date.now()}`,
        views: 1,
        publishDate: article.publishDate || now,
        status: "published",
        tags: ["समाचार", "त्रिकाल दर्शन"],
        ...article
      };
      inMemoryDb.news.unshift(newArticle);
      saveDatabaseToDisk();
      return res.json(newArticle);
    }
  });

  app.delete("/api/articles/:id", (req, res) => {
    const { id } = req.params;
    inMemoryDb.news = inMemoryDb.news.filter((a: any) => a.id !== id);
    saveDatabaseToDisk();
    res.json({ success: true, id });
  });

  // --- CATEGORIES CRUD ---
  app.get("/api/categories", (req, res) => {
    res.json(inMemoryDb.categories);
  });

  app.post("/api/categories", (req, res) => {
    const cat = req.body;
    const idx = inMemoryDb.categories.findIndex((c: any) => c.id === cat.id);
    if (idx !== -1) {
      inMemoryDb.categories[idx] = { ...inMemoryDb.categories[idx], ...cat };
      saveDatabaseToDisk();
      return res.json(inMemoryDb.categories[idx]);
    }
    const newCat = {
      id: cat.id || `cat-${Date.now()}`,
      sortOrder: cat.sortOrder || inMemoryDb.categories.length + 1,
      isHidden: false,
      ...cat
    };
    inMemoryDb.categories.push(newCat);
    saveDatabaseToDisk();
    res.json(newCat);
  });

  app.delete("/api/categories/:id", (req, res) => {
    const { id } = req.params;
    inMemoryDb.categories = inMemoryDb.categories.filter((c: any) => c.id !== id);
    saveDatabaseToDisk();
    res.json({ success: true, id });
  });

  // --- LOCATIONS CRUD ---
  app.post("/api/districts", (req, res) => {
    const dt = req.body;
    const idx = inMemoryDb.districts.findIndex((d: any) => d.id === dt.id);
    if (idx !== -1) {
      inMemoryDb.districts[idx] = { ...inMemoryDb.districts[idx], ...dt };
      saveDatabaseToDisk();
      return res.json(inMemoryDb.districts[idx]);
    }
    const newDt = {
      id: dt.id || `dt-${Date.now()}`,
      stateId: dt.stateId || "st-mp",
      isEnabled: true,
      ...dt
    };
    inMemoryDb.districts.push(newDt);
    saveDatabaseToDisk();
    res.json(newDt);
  });

  app.delete("/api/districts/:id", (req, res) => {
    const { id } = req.params;
    inMemoryDb.districts = inMemoryDb.districts.filter((d: any) => d.id !== id);
    saveDatabaseToDisk();
    res.json({ success: true, id });
  });

  // --- REPORTERS CRUD ---
  app.post("/api/reporters", (req, res) => {
    const rep = req.body;
    const idx = inMemoryDb.reporters.findIndex((r: any) => r.id === rep.id);
    if (idx !== -1) {
      inMemoryDb.reporters[idx] = { ...inMemoryDb.reporters[idx], ...rep };
      saveDatabaseToDisk();
      return res.json(inMemoryDb.reporters[idx]);
    }
    const newRep = {
      id: rep.id || `rep-${Date.now()}`,
      articlesCount: 0,
      status: "active",
      memberId: rep.memberId || `TDS-MEM-${Math.floor(8000 + Math.random() * 1000)}`,
      ...rep
    };
    inMemoryDb.reporters.push(newRep);
    saveDatabaseToDisk();
    res.json(newRep);
  });

  app.delete("/api/reporters/:id", (req, res) => {
    const { id } = req.params;
    inMemoryDb.reporters = inMemoryDb.reporters.filter((r: any) => r.id !== id);
    saveDatabaseToDisk();
    res.json({ success: true, id });
  });

  // --- APPLICATIONS CRUD ---
  app.post("/api/applications", (req, res) => {
    const appData = req.body;
    const appId = appData.id || `TDS-APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp = {
      ...appData,
      id: appId,
      status: appData.status || "pending",
      submittedAt: appData.submittedAt || new Date().toISOString()
    };
    inMemoryDb.applications.unshift(newApp);
    saveDatabaseToDisk();
    res.json(newApp);
  });

  app.put("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const idx = inMemoryDb.applications.findIndex((a: any) => a.id === id);
    if (idx === -1) return res.status(404).json({ error: "Application not found" });

    inMemoryDb.applications[idx] = { ...inMemoryDb.applications[idx], ...updateData };
    saveDatabaseToDisk();
    res.json(inMemoryDb.applications[idx]);
  });

  app.delete("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    inMemoryDb.applications = inMemoryDb.applications.filter((a: any) => a.id !== id);
    saveDatabaseToDisk();
    res.json({ success: true, id });
  });

  // --- ID CARDS & JOINING LETTERS ---
  app.post("/api/id-cards", (req, res) => {
    const card = req.body;
    const idx = inMemoryDb.idCards.findIndex((c: any) => c.id === card.id);
    if (idx !== -1) {
      inMemoryDb.idCards[idx] = { ...inMemoryDb.idCards[idx], ...card };
      saveDatabaseToDisk();
      return res.json(inMemoryDb.idCards[idx]);
    }
    inMemoryDb.idCards.unshift(card);
    saveDatabaseToDisk();
    res.json(card);
  });

  app.delete("/api/id-cards/:id", (req, res) => {
    const { id } = req.params;
    inMemoryDb.idCards = inMemoryDb.idCards.filter((c: any) => c.id !== id);
    saveDatabaseToDisk();
    res.json({ success: true, id });
  });

  app.post("/api/joining-letters", (req, res) => {
    const letter = req.body;
    const idx = inMemoryDb.joiningLetters.findIndex((l: any) => l.id === letter.id);
    if (idx !== -1) {
      inMemoryDb.joiningLetters[idx] = { ...inMemoryDb.joiningLetters[idx], ...letter };
      saveDatabaseToDisk();
      return res.json(inMemoryDb.joiningLetters[idx]);
    }
    inMemoryDb.joiningLetters.unshift(letter);
    saveDatabaseToDisk();
    res.json(letter);
  });

  app.delete("/api/joining-letters/:id", (req, res) => {
    const { id } = req.params;
    inMemoryDb.joiningLetters = inMemoryDb.joiningLetters.filter((l: any) => l.id !== id);
    saveDatabaseToDisk();
    res.json({ success: true, id });
  });

  // --- ADVERTISEMENTS CRUD ---
  app.post("/api/advertisements", (req, res) => {
    const ad = req.body;
    const idx = inMemoryDb.advertisements.findIndex((a: any) => a.id === ad.id);
    if (idx !== -1) {
      inMemoryDb.advertisements[idx] = { ...inMemoryDb.advertisements[idx], ...ad };
      saveDatabaseToDisk();
      return res.json(inMemoryDb.advertisements[idx]);
    }
    const newAd = {
      id: ad.id || `ad-${Date.now()}`,
      isActive: true,
      impressions: 0,
      clicks: 0,
      ...ad
    };
    inMemoryDb.advertisements.push(newAd);
    saveDatabaseToDisk();
    res.json(newAd);
  });

  app.delete("/api/advertisements/:id", (req, res) => {
    const { id } = req.params;
    inMemoryDb.advertisements = inMemoryDb.advertisements.filter((a: any) => a.id !== id);
    saveDatabaseToDisk();
    res.json({ success: true, id });
  });

  // --- SETTINGS & SOCIAL LINKS ---
  app.post("/api/settings", (req, res) => {
    const newSettings = req.body;
    inMemoryDb.settings = { ...inMemoryDb.settings, ...newSettings };
    saveDatabaseToDisk();
    res.json(inMemoryDb.settings);
  });

  app.post("/api/social-links", (req, res) => {
    const links = req.body;
    if (Array.isArray(links)) {
      inMemoryDb.socialLinks = links;
      saveDatabaseToDisk();
    }
    res.json(inMemoryDb.socialLinks);
  });

  // Factory Reset
  app.post("/api/reset-data", (req, res) => {
    inMemoryDb = getDefaultDatabase();
    saveDatabaseToDisk();
    res.json({ success: true, message: "Database reset to factory defaults" });
  });

  // Admin authentication endpoint
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body || {};
    const u = (username || "").trim().toLowerCase();
    const p = password || "";

    const isValidUser = u === "trikaldarshansamachar" || u === "admin" || u === "trikaldarshannews72@gmail.com";
    const isValidPass = p === "trikal@123" || p === "trikal123" || p === "admin" || p === "admin123";

    if (isValidUser && isValidPass) {
      return res.json({
        success: true,
        token: `tds_token_${Date.now()}`,
        user: {
          id: "admin-1",
          name: "प्रधान सम्पादक (Admin)",
          email: "trikaldarshannews72@gmail.com",
          role: "super_admin"
        }
      });
    }
    return res.status(401).json({
      success: false,
      message: "अमान्य उपयोगकर्ता नाम या पासवर्ड! (Username: admin / trikaldarshansamachar, Pass: trikal123)"
    });
  });

  // Public verification endpoint for Press ID Cards
  app.get("/api/verify-press-id/:pressId", (req, res) => {
    const { pressId } = req.params;
    const card = inMemoryDb.idCards.find((c: any) => c.pressId?.toLowerCase() === pressId.toLowerCase() || c.id === pressId);
    if (card) {
      return res.json({
        pressId: card.pressId,
        name: card.name,
        designation: card.designation,
        district: card.districtName,
        state: card.stateName,
        status: card.status,
        validUntil: card.validUntil,
        verified: true,
        organization: "त्रिकाल दर्शन समाचार",
        tagline: "सत्य की त्रिकाल दृष्टि",
        verificationUrl: `${process.env.APP_URL || ""}/verify/${card.pressId}`
      });
    }
    res.json({
      pressId,
      verified: false,
      organization: "त्रिकाल दर्शन समाचार",
      tagline: "सत्य की त्रिकाल दृष्टि",
      message: "परिचय पत्र रिकॉर्ड में नहीं मिला।"
    });
  });

  // --- DYNAMIC SERVER-SIDE OPEN GRAPH & SOCIAL PREVIEW GENERATOR ---
  function getDefaultFallbackImage(baseUrl: string): string {
    return `${baseUrl}/logo.png`;
  }

  function getBaseUrl(req: express.Request): string {
    const rawForwardedHost = req.headers["x-forwarded-host"];
    const rawHost = rawForwardedHost || req.headers.host || req.get("host") || "";
    const host = Array.isArray(rawHost) ? rawHost[0] : String(rawHost).split(",")[0].trim();

    const forwardedProto = req.headers["x-forwarded-proto"];
    const proto = typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : req.protocol || "https";

    if (host && !host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("0.0.0.0")) {
      const isCustomDomain = host.includes("trikaldarshansamachar.com");
      const effectiveProto = isCustomDomain ? "https" : proto;
      return `${effectiveProto}://${host}`.replace(/\/+$/, "");
    }

    if (process.env.APP_URL && process.env.APP_URL.trim() !== "") {
      return process.env.APP_URL.trim().replace(/\/+$/, "");
    }

    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("0.0.0.0");
    const effectiveProto = isLocal ? proto : "https";
    const fallbackHost = host || "trikaldarshansamachar.com";

    return `${effectiveProto}://${fallbackHost}`.replace(/\/+$/, "");
  }

  function resolveArticleImageUrl(article: any, baseUrl: string): string {
    if (!article) return DEFAULT_FALLBACK_IMAGE;

    let rawImg =
      article.featuredImage ||
      article.image ||
      article.imageUrl ||
      article.thumbnail ||
      (Array.isArray(article.galleryImages) && article.galleryImages[0]);

    if (!rawImg && article.content && typeof article.content === "string") {
      const match = article.content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) rawImg = match[1];
    }

    if (!rawImg || typeof rawImg !== "string") {
      return getDefaultFallbackImage(baseUrl);
    }

    const trimmed = rawImg.trim();
    if (!trimmed) {
      return getDefaultFallbackImage(baseUrl);
    }

    // 1. If Base64 image data, WhatsApp cannot parse raw inline data URIs in og:image, so serve via image endpoint
    if (
      trimmed.startsWith("data:image/") ||
      (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/") && trimmed.length > 100)
    ) {
      const cleanId = String(article.id || article.slug || "news").replace(/[^a-zA-Z0-9_-]/g, "") || "news";
      return `${baseUrl}/img/${cleanId}.jpg`;
    }

    // 2. If already absolute HTTPS URL
    if (trimmed.startsWith("https://")) {
      return trimmed;
    }

    // 3. If HTTP, upgrade to HTTPS if not local
    if (trimmed.startsWith("http://")) {
      if (!trimmed.includes("localhost") && !trimmed.includes("127.0.0.1")) {
        return trimmed.replace(/^http:\/\//i, "https://");
      }
      return trimmed;
    }

    // 4. If relative local asset path
    if (trimmed.startsWith("/")) {
      return `${baseUrl}${trimmed}`;
    }

    const cleanId = String(article.id || article.slug || "news").replace(/[^a-zA-Z0-9_-]/g, "") || "news";
    return `${baseUrl}/img/${cleanId}.jpg`;
  }

  async function findArticleAsync(idOrSlug: string): Promise<any> {
    if (!idOrSlug) return null;
    let raw = idOrSlug.trim().replace(/\.(jpg|jpeg|png|webp|html)$/i, "").replace(/\/+$/, "");
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw).trim();
    } catch {}

    // 1. Check inMemoryDb first (fastest)
    let found = inMemoryDb.news.find((a: any) => articleMatchesKey(a, raw) || articleMatchesKey(a, decoded));
    if (found) return found;

    // 2. Check local database.json file on disk before hitting Firestore
    if (fs.existsSync(DB_FILE)) {
      try {
        const rawJson = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(rawJson);
        if (parsed && Array.isArray(parsed.news)) {
          found = parsed.news.find((a: any) => articleMatchesKey(a, raw) || articleMatchesKey(a, decoded));
          if (found) {
            inMemoryDb.news = parsed.news;
            return found;
          }
        }
      } catch {}
    }

    // 3. Direct Firestore lookup
    try {
      // Try by document ID
      const directDoc = await getDoc(doc(firestoreDb, "news", raw));
      if (directDoc.exists()) {
        const data = directDoc.data();
        if (data) {
          inMemoryDb.news.unshift(data);
          return data;
        }
      }

      if (decoded !== raw) {
        const directDecodedDoc = await getDoc(doc(firestoreDb, "news", decoded));
        if (directDecodedDoc.exists()) {
          const data = directDecodedDoc.data();
          if (data) {
            inMemoryDb.news.unshift(data);
            return data;
          }
        }
      }

      // Try by slug field
      const q1 = query(collection(firestoreDb, "news"), where("slug", "==", raw));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        const data = snap1.docs[0].data();
        inMemoryDb.news.unshift(data);
        return data;
      }

      if (decoded !== raw) {
        const q2 = query(collection(firestoreDb, "news"), where("slug", "==", decoded));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          const data = snap2.docs[0].data();
          inMemoryDb.news.unshift(data);
          return data;
        }
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("Quota exceeded") || msg.includes("quota metric")) {
        console.warn("[Firestore Search] Notice: Firestore daily read quota reached, using server memory & disk cache.");
      } else {
        console.warn("[Firestore Search] Query notice:", msg);
      }
    }

    return null;
  }

  function escapeHtml(str: string | undefined | null): string {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function cleanPlainText(str: string | undefined | null, maxLength: number = 200): string {
    if (!str) return "";
    const cleaned = String(str)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength).trim() + "...";
  }

  interface PageMeta {
    title: string;
    description: string;
    url: string;
    image: string;
    type: "article" | "website";
    author?: string;
    publishedTime?: string;
    section?: string;
  }

  function injectMetaTags(html: string, meta: PageMeta): string {
    let cleaned = html
      .replace(/<title>[\s\S]*?<\/title>/gi, "")
      .replace(/<meta\s+name=["']description["'][\s\S]*?>/gi, "")
      .replace(/<link\s+rel=["']canonical["'][\s\S]*?>/gi, "")
      .replace(/<meta\s+property=["']og:[^"']*["'][\s\S]*?>/gi, "")
      .replace(/<meta\s+property=["']article:[^"']*["'][\s\S]*?>/gi, "")
      .replace(/<meta\s+name=["']twitter:[^"']*["'][\s\S]*?>/gi, "");

    const imageType = meta.image.endsWith(".png") ? "image/png" : meta.image.endsWith(".webp") ? "image/webp" : "image/jpeg";

    const metaBlock = `
    <!-- Dynamic Server-Rendered Social & Open Graph Metadata for WhatsApp / Facebook / Twitter -->
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${escapeHtml(meta.url)}" />

    <!-- Open Graph / WhatsApp Preview Tags -->
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:site_name" content="त्रिकाल दर्शन समाचार" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
    <meta property="og:image" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:type" content="${imageType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(meta.title)}" />
    <meta property="og:locale" content="hi_IN" />
    ${meta.publishedTime ? `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />` : ""}
    ${meta.author ? `<meta property="article:author" content="${escapeHtml(meta.author)}" />` : ""}
    ${meta.section ? `<meta property="article:section" content="${escapeHtml(meta.section)}" />` : ""}

    <!-- Twitter / X Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />
    <meta name="twitter:image:src" content="${escapeHtml(meta.image)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(meta.title)}" />

    <!-- Schema.org / Search Engine Direct Tags -->
    <meta itemprop="name" content="${escapeHtml(meta.title)}" />
    <meta itemprop="description" content="${escapeHtml(meta.description)}" />
    <meta itemprop="image" content="${escapeHtml(meta.image)}" />
    <link rel="image_src" href="${escapeHtml(meta.image)}" />
`;

    if (cleaned.includes("</head>")) {
      return cleaned.replace("</head>", `${metaBlock}\n  </head>`);
    } else if (cleaned.includes("<head>")) {
      return cleaned.replace("<head>", `<head>\n${metaBlock}`);
    }
    return `${metaBlock}\n${cleaned}`;
  }

  async function handlePageRender(req: express.Request, res: express.Response, vite?: any) {
    try {
      const rawPath = req.path || "/";
      const baseUrl = getBaseUrl(req);
      let meta: PageMeta;

      // Check if it is an article page: /article/:idOrSlug, /n/:idOrSlug, /a/:idOrSlug, /news/:idOrSlug
      const articleMatch = rawPath.match(/^\/(article|n|a|news)\/([^/]+)/i);
      if (articleMatch) {
        const idOrSlug = articleMatch[2];
        const article = await findArticleAsync(idOrSlug);
        if (article) {
          const cleanSlugOrId = (article.slug && /^[a-z0-9-]+$/i.test(article.slug)) ? article.slug : article.id;
          const canonicalUrl = `${baseUrl}/article/${cleanSlugOrId}`;
          const absImageUrl = resolveArticleImageUrl(article, baseUrl);
          const description = cleanPlainText(
            article.subtitle || article.summary || article.content,
            180
          ) || "सत्य की त्रिकाल दृष्टि - पढ़ें पूरी खबर त्रिकाल दर्शन समाचार पर।";

          const articleTitle = article.title ? `${article.title} | त्रिकाल दर्शन समाचार` : "त्रिकाल दर्शन समाचार";

          meta = {
            type: "article",
            title: articleTitle,
            description,
            url: canonicalUrl,
            image: absImageUrl,
            author: article.authorName || article.reporterName || "त्रिकाल दर्शन समाचार",
            publishedTime: article.publishDate || new Date().toISOString(),
            section: article.categoryName || "समाचार"
          };
        } else {
          meta = {
            type: "website",
            title: "त्रिकाल दर्शन समाचार - सत्य की त्रिकाल दृष्टि",
            description: "भारत और आपके शहर की ताज़ा ख़बरें, स्थानीय समाचार, निष्पक्ष पत्रकारिता और Ground Report।",
            url: `${baseUrl}${rawPath}`,
            image: getDefaultFallbackImage(baseUrl)
          };
        }
      } else if (rawPath.startsWith("/category/")) {
        const catSlug = rawPath.replace("/category/", "").replace(/\/+$/, "").trim().toLowerCase();
        const cat = inMemoryDb.categories.find((c: any) => c.slug?.toLowerCase() === catSlug || c.id?.toLowerCase() === catSlug);
        const catName = cat ? cat.nameHindi : "समाचार";
        meta = {
          type: "website",
          title: `${catName} समाचार | त्रिकाल दर्शन समाचार`,
          description: `त्रिकाल दर्शन समाचार पर पढ़ें ${catName} की ताज़ा और प्रामाणिक ख़बरें। सत्य की त्रिकाल दृष्टि।`,
          url: `${baseUrl}${rawPath}`,
          image: getDefaultFallbackImage(baseUrl)
        };
      } else {
        meta = {
          type: "website",
          title: "त्रिकाल दर्शन समाचार - सत्य की त्रिकाल दृष्टि | Trikal Darshan Samachar",
          description: "भारत और आपके शहर की ताज़ा ख़बरें, स्थानीय समाचार, निष्पक्ष पत्रकारिता और Ground Report। सत्य की त्रिकाल दृष्टि।",
          url: `${baseUrl}${rawPath}`,
          image: getDefaultFallbackImage(baseUrl)
        };
      }

      let templateHtml = "";
      const isProd = process.env.NODE_ENV === "production";
      if (isProd) {
        const distIndex = path.join(process.cwd(), "dist", "index.html");
        if (fs.existsSync(distIndex)) {
          templateHtml = fs.readFileSync(distIndex, "utf-8");
        } else {
          templateHtml = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
        }
      } else {
        const devIndex = path.join(process.cwd(), "index.html");
        templateHtml = fs.readFileSync(devIndex, "utf-8");
        if (vite) {
          templateHtml = await vite.transformIndexHtml(req.originalUrl, templateHtml);
        }
      }

      const finalHtml = injectMetaTags(templateHtml, meta);
      res.status(200).set({
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=300"
      }).send(finalHtml);
    } catch (err) {
      console.error("[SSR Meta Error]", err);
      const fallbackPath = process.env.NODE_ENV === "production"
        ? path.join(process.cwd(), "dist", "index.html")
        : path.join(process.cwd(), "index.html");
      res.sendFile(fallbackPath);
    }
  }

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "custom",
    });

    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      if (path.extname(req.path)) return next();
      await handlePageRender(req, res, vite);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false }));

    app.use(async (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      if (path.extname(req.path)) return next();
      await handlePageRender(req, res);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trikal Darshan Samachar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
