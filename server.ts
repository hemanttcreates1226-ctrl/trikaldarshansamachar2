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
  setDoc,
  deleteDoc,
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
import {
  articleMatchesKey,
  resolveArticleImageUrl,
  extractArticleRawImage,
  sanitizePublicOrigin,
  PUBLIC_CANONICAL_DOMAIN
} from "./src/lib/slugHelper";

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

const LEGACY_MOCK_IDS = new Set(['news-1', 'news-2', 'news-3', 'news-4', 'news-5', 'news-6', 'news-7', 'news-8']);

function loadDatabaseFromDisk(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const loadedNews = Array.isArray(parsed.news) ? parsed.news.filter((a: any) => !LEGACY_MOCK_IDS.has(a.id)) : [];
        inMemoryDb = {
          ...getDefaultDatabase(),
          ...parsed,
          news: loadedNews,
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
    // 1. News Articles
    const newsCol = collection(firestoreDb, "news");
    onSnapshot(newsCol, (snapshot) => {
      if (snapshot.empty) {
        inMemoryDb.news = [];
        saveDatabaseToDisk();
        return;
      }

      const cloudArticles: any[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data && data.id) {
          if (LEGACY_MOCK_IDS.has(data.id)) {
            try {
              deleteDoc(doc(firestoreDb, "news", data.id));
            } catch {}
          } else {
            cloudArticles.push(data);
          }
        }
      });

      // Merge cloud articles with in-memory db, preserving rich image data
      const cloudMap = new Map<string, any>();
      cloudArticles.forEach((a) => cloudMap.set(a.id, a));

      const merged: any[] = [];
      cloudArticles.forEach((c) => {
        const local = inMemoryDb.news.find((l: any) => l.id === c.id);
        if (
          local &&
          (!c.featuredImage || c.featuredImage.startsWith("/api/articles") || c.featuredImage.startsWith("/img/")) &&
          local.featuredImage &&
          !local.featuredImage.startsWith("/api/articles") &&
          !local.featuredImage.startsWith("/img/")
        ) {
          merged.push({ ...c, featuredImage: local.featuredImage, image: local.featuredImage });
        } else {
          merged.push(c);
        }
      });

      // Keep recent in-memory items (e.g. newly published articles not yet in Firestore snapshot)
      inMemoryDb.news.forEach((l: any) => {
        if (!cloudMap.has(l.id) && !LEGACY_MOCK_IDS.has(l.id)) {
          const age = Date.now() - new Date(l.publishDate || l.updatedDate || 0).getTime();
          if (age < 120000) {
            merged.push(l);
          }
        }
      });

      merged.sort((a, b) => {
        const dateA = new Date(a.publishDate || a.updatedDate || 0).getTime();
        const dateB = new Date(b.publishDate || b.updatedDate || 0).getTime();
        return dateB - dateA;
      });

      inMemoryDb.news = merged;
      saveDatabaseToDisk();
    }, (err) => {
      console.warn("[Firestore Sync] News listener warning:", err.message);
    });

    // 2. Settings
    const settingsDoc = doc(firestoreDb, "settings", "main");
    onSnapshot(settingsDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
          inMemoryDb.settings = { ...inMemoryDb.settings, ...data };
          saveDatabaseToDisk();
        }
      }
    }, (err) => {
      console.warn("[Firestore Sync] Settings listener warning:", err.message);
    });

    // 3. Categories
    const catCol = collection(firestoreDb, "categories");
    onSnapshot(catCol, (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) list.push(data);
        });
        list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        inMemoryDb.categories = list;
        saveDatabaseToDisk();
      }
    }, (err) => {
      console.warn("[Firestore Sync] Categories listener warning:", err.message);
    });

    // 4. Advertisements
    const adCol = collection(firestoreDb, "advertisements");
    onSnapshot(adCol, (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) list.push(data);
        });
        inMemoryDb.advertisements = list;
        saveDatabaseToDisk();
      }
    }, (err) => {
      console.warn("[Firestore Sync] Ads listener warning:", err.message);
    });

    // 5. Reporters
    const repCol = collection(firestoreDb, "reporters");
    onSnapshot(repCol, (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) list.push(data);
        });
        inMemoryDb.reporters = list;
        saveDatabaseToDisk();
      }
    }, (err) => {
      console.warn("[Firestore Sync] Reporters listener warning:", err.message);
    });

    // 6. Applications
    const appCol = collection(firestoreDb, "member_applications");
    onSnapshot(appCol, (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) list.push(data);
        });
        inMemoryDb.applications = list;
        saveDatabaseToDisk();
      }
    }, (err) => {
      console.warn("[Firestore Sync] Applications listener warning:", err.message);
    });

    // 7. Joining Letters
    const jlCol = collection(firestoreDb, "joining_letters");
    onSnapshot(jlCol, (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) list.push(data);
        });
        inMemoryDb.joiningLetters = list;
        saveDatabaseToDisk();
      }
    }, (err) => {
      console.warn("[Firestore Sync] Joining letters listener warning:", err.message);
    });

    // 8. ID Cards
    const idCol = collection(firestoreDb, "id_cards");
    onSnapshot(idCol, (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) list.push(data);
        });
        inMemoryDb.idCards = list;
        saveDatabaseToDisk();
      }
    }, (err) => {
      console.warn("[Firestore Sync] ID cards listener warning:", err.message);
    });

    // 9. States
    const stateCol = collection(firestoreDb, "states");
    onSnapshot(stateCol, (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) list.push(data);
        });
        inMemoryDb.states = list;
        saveDatabaseToDisk();
      }
    }, (err) => {
      console.warn("[Firestore Sync] States listener warning:", err.message);
    });

    // 10. Districts
    const dtCol = collection(firestoreDb, "districts");
    onSnapshot(dtCol, (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) list.push(data);
        });
        inMemoryDb.districts = list;
        saveDatabaseToDisk();
      }
    }, (err) => {
      console.warn("[Firestore Sync] Districts listener warning:", err.message);
    });

    // 11. Social Links
    const socialDoc = doc(firestoreDb, "settings", "social");
    onSnapshot(socialDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.links)) {
          inMemoryDb.socialLinks = data.links;
          saveDatabaseToDisk();
        }
      }
    }, (err) => {
      console.warn("[Firestore Sync] Social links listener warning:", err.message);
    });

    // 12. Panchang
    const panchangDoc = doc(firestoreDb, "system", "panchang");
    onSnapshot(panchangDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
          inMemoryDb.panchang = data;
          saveDatabaseToDisk();
        }
      }
    }, (err) => {
      console.warn("[Firestore Sync] Panchang listener warning:", err.message);
    });

    console.log("[Firestore Sync] All collections synchronized and listening for live changes");
  } catch (err) {
    console.warn("[Firestore Sync] Could not initialize Firestore listeners:", err);
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
      "/img/:idOrSlug.jpeg",
      "/img/:idOrSlug.png",
      "/img/:idOrSlug.webp",
      "/img/:idOrSlug",
      "/thumbnail/:idOrSlug.jpg",
      "/thumbnail/:idOrSlug",
      "/api/articles/:idOrSlug/image",
      "/api/articles/:idOrSlug/image.jpg",
      "/api/articles/:idOrSlug/thumbnail.jpg",
      "/api/article-image/:idOrSlug"
    ],
    async (req, res) => {
      try {
        const { idOrSlug } = req.params;
        const cleanKey = (idOrSlug || "").replace(/\.(jpg|jpeg|png|webp|gif)$/i, "").trim();
        let decodedKey = cleanKey;
        try {
          decodedKey = decodeURIComponent(cleanKey);
        } catch {}

        let article = await findArticleAsync(cleanKey);
        if (!article && decodedKey !== cleanKey) {
          article = await findArticleAsync(decodedKey);
        }

        const logoPath = path.join(process.cwd(), "public", "logo.png");
        const sendBrandFallback = () => {
          if (fs.existsSync(logoPath)) {
            res.setHeader("Content-Type", "image/png");
            res.setHeader("Cache-Control", "public, max-age=86400");
            return res.sendFile(logoPath);
          }
          return res.status(404).send("Image not found");
        };

        if (!article) {
          return sendBrandFallback();
        }

        // Extract raw image using unified extractor across all article fields
        const rawFeatured = extractArticleRawImage(article);

        if (!rawFeatured) {
          return sendBrandFallback();
        }

        const featured = String(rawFeatured).trim();

        // 1. If Base64 Image (data:image/... or raw base64 string)
        if (
          featured.startsWith("data:") ||
          (!featured.startsWith("http://") && !featured.startsWith("https://") && !featured.startsWith("/") && featured.length > 50)
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
              const etag = `"${article.id || cleanKey}-${imageBuffer.length}"`;
              res.set({
                "Content-Type": mimeType,
                "Content-Length": imageBuffer.length.toString(),
                "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
                "Access-Control-Allow-Origin": "*",
                "Accept-Ranges": "bytes",
                "ETag": etag
              });
              if (req.headers["if-none-match"] === etag) {
                return res.status(304).end();
              }
              return res.status(200).send(imageBuffer);
            }
          } catch (e) {
            console.error("[Image Endpoint] Base64 decode error:", e);
          }
          return sendBrandFallback();
        }

        // 2. If absolute HTTPS or HTTP URL (e.g. external CDN, Cloud Storage)
        if (featured.startsWith("https://") || featured.startsWith("http://")) {
          return res.redirect(302, featured);
        }

        // 3. If local relative asset path (avoid self-reference loops)
        if (featured.startsWith("/")) {
          if (!featured.startsWith("/img/") && !featured.startsWith("/api/articles/")) {
            const localPath = path.join(process.cwd(), featured.replace(/^\//, ""));
            if (fs.existsSync(localPath)) {
              return res.sendFile(localPath);
            }
          }
        }

        return sendBrandFallback();
      } catch (err) {
        console.error("[Image Endpoint Error]", err);
        const logoPath = path.join(process.cwd(), "public", "logo.png");
        if (fs.existsSync(logoPath)) {
          res.setHeader("Content-Type", "image/png");
          return res.sendFile(logoPath);
        }
        return res.status(500).send("Error loading image");
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

  app.post("/api/articles", async (req, res) => {
    const article = req.body;
    if (!article) return res.status(400).json({ error: "Article data required" });

    const now = new Date().toISOString();
    const idx = inMemoryDb.news.findIndex((a: any) => a.id === article.id);
    let savedArticle: any;
    if (idx !== -1) {
      inMemoryDb.news[idx] = { ...inMemoryDb.news[idx], ...article, updatedDate: now };
      savedArticle = inMemoryDb.news[idx];
    } else {
      savedArticle = {
        id: article.id || `news-${Date.now()}`,
        views: 1,
        publishDate: article.publishDate || now,
        status: "published",
        tags: ["समाचार", "त्रिकाल दर्शन"],
        ...article
      };
      inMemoryDb.news.unshift(savedArticle);
    }
    saveDatabaseToDisk();

    // Sync to Firestore in background
    try {
      await setDoc(doc(firestoreDb, "news", savedArticle.id), savedArticle, { merge: true });
    } catch (e) {
      console.warn("[Server DB] Could not sync article to Firestore:", e);
    }

    return res.json(savedArticle);
  });

  app.delete("/api/articles/:id", async (req, res) => {
    const { id } = req.params;
    inMemoryDb.news = inMemoryDb.news.filter((a: any) => a.id !== id);
    saveDatabaseToDisk();

    // Delete from Firestore in background
    try {
      await deleteDoc(doc(firestoreDb, "news", id));
    } catch (e) {
      console.warn("[Server DB] Could not delete article from Firestore:", e);
    }

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

  // Robots.txt for search engines
  app.get("/robots.txt", (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  // Dynamic Sitemap.xml
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = getBaseUrl(req);
    const articles = Array.isArray(inMemoryDb.news) ? inMemoryDb.news : [];
    const categories = Array.isArray(inMemoryDb.categories) ? inMemoryDb.categories : [];

    const articleUrls = articles.map((a: any) => {
      const slugOrId = (a.slug && /^[a-z0-9-]+$/i.test(a.slug)) ? a.slug : a.id;
      const date = a.publishDate ? new Date(a.publishDate).toISOString() : new Date().toISOString();
      return `  <url>
    <loc>${baseUrl}/post/${slugOrId}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join("\n");

    const categoryUrls = categories.map((c: any) => {
      const slug = c.slug || c.id;
      return `  <url>
    <loc>${baseUrl}/category/${slug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/join-us</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
${categoryUrls}
${articleUrls}
</urlset>`;

    res.type("application/xml");
    res.send(xml);
  });

  // --- DYNAMIC SERVER-SIDE OPEN GRAPH & SOCIAL PREVIEW GENERATOR ---
  function getBaseUrl(req: express.Request): string {
    const rawForwardedHost = req.headers["x-forwarded-host"];
    const rawHost = rawForwardedHost || req.headers.host || req.get("host") || "";
    const host = Array.isArray(rawHost) ? rawHost[0] : String(rawHost).split(",")[0].trim();

    // If host is the live production domain or a valid custom public domain (excluding private dev/preview instances)
    if (
      host &&
      !host.includes("localhost") &&
      !host.includes("127.0.0.1") &&
      !host.includes("0.0.0.0") &&
      !host.includes("ais-dev-")
    ) {
      const forwardedProto = req.headers["x-forwarded-proto"];
      const proto = typeof forwardedProto === "string" ? forwardedProto.split(",")[0].trim() : (req.protocol || "https");
      const effectiveProto = (host.includes(".run.app") || host.includes("trikaldarshansamachar.com") || host.includes(".")) ? "https" : proto;
      return `${effectiveProto}://${host}`.replace(/\/+$/, "");
    }

    if (process.env.PUBLIC_APP_URL && process.env.PUBLIC_APP_URL.trim() !== "") {
      return process.env.PUBLIC_APP_URL.trim().replace(/\/+$/, "");
    }

    // For social crawlers (WhatsApp, Facebook, Telegram) and public meta tags,
    // point to the publicly accessible canonical domain
    return PUBLIC_CANONICAL_DOMAIN;
  }

  function getSiteDefaultImage(baseUrl: string): string {
    return `${baseUrl}/logo.png`;
  }

  function searchListForArticle(list: any[], rawKey: string, decodedKey: string): any {
    if (!Array.isArray(list) || list.length === 0) return null;

    const rawLower = rawKey.toLowerCase();
    const decLower = decodedKey.toLowerCase();

    // 1. Exact ID match (case-sensitive and case-insensitive)
    let found = list.find((a: any) => {
      const aid = String(a.id || "").trim();
      return aid === rawKey || aid === decodedKey || aid.toLowerCase() === rawLower || aid.toLowerCase() === decLower;
    });
    if (found) return found;

    // 2. Exact Slug match (case-sensitive and case-insensitive)
    found = list.find((a: any) => {
      const aslug = String(a.slug || "").trim();
      return aslug === rawKey || aslug === decodedKey || aslug.toLowerCase() === rawLower || aslug.toLowerCase() === decLower;
    });
    if (found) return found;

    // 3. Extracted ID matching (e.g. from slug ending in news-178... or art-...)
    const idMatch = rawKey.match(/(news-\d+|art-\d+)/i) || decodedKey.match(/(news-\d+|art-\d+)/i);
    if (idMatch) {
      const targetId = idMatch[1].toLowerCase();
      found = list.find((a: any) => String(a.id || "").trim().toLowerCase() === targetId);
      if (found) return found;
    }

    // 4. Clean path prefix removal match (e.g. /post/xyz -> xyz)
    const cleanRaw = rawKey.replace(/^\/?(post|article|news|share|p|n|a)\//i, "").replace(/\/+$/, "").trim().toLowerCase();
    const cleanDec = decodedKey.replace(/^\/?(post|article|news|share|p|n|a)\//i, "").replace(/\/+$/, "").trim().toLowerCase();
    if (cleanRaw) {
      found = list.find((a: any) => {
        const aid = String(a.id || "").trim().toLowerCase();
        const aslug = String(a.slug || "").trim().toLowerCase();
        return aid === cleanRaw || aslug === cleanRaw || aid === cleanDec || aslug === cleanDec;
      });
      if (found) return found;
    }

    // 5. Exact numeric timestamp ID match (require >= 10 digits to avoid false collisions)
    const numKey = rawKey.replace(/\D/g, "");
    if (numKey.length >= 10) {
      found = list.find((a: any) => {
        const nid = String(a.id || "").replace(/\D/g, "");
        return nid && (nid === numKey || nid.endsWith(numKey));
      });
      if (found) return found;
    }

    // 6. High-confidence match via articleMatchesKey (strict match = true to prevent loose cross-article contamination)
    return list.find((a: any) => articleMatchesKey(a, rawKey, true) || articleMatchesKey(a, decodedKey, true)) || null;
  }

  async function findArticleAsync(idOrSlug: string): Promise<any> {
    if (!idOrSlug) return null;
    let raw = idOrSlug.trim().replace(/\.(jpg|jpeg|png|webp|html)$/i, "").replace(/\/+$/, "");
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw).trim();
    } catch {}

    // 1. Check inMemoryDb first (fastest)
    let found = searchListForArticle(inMemoryDb.news, raw, decoded);
    if (found) return found;

    // 2. Check local database.json file on disk before hitting Firestore
    if (fs.existsSync(DB_FILE)) {
      try {
        const rawJson = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(rawJson);
        if (parsed && Array.isArray(parsed.news)) {
          found = searchListForArticle(parsed.news, raw, decoded);
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

  function isSocialCrawler(userAgent: string | undefined | null): boolean {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    return (
      ua.includes("whatsapp") ||
      ua.includes("facebookexternalhit") ||
      ua.includes("facebot") ||
      ua.includes("twitterbot") ||
      ua.includes("telegrambot") ||
      ua.includes("linkedinbot") ||
      ua.includes("pinterest") ||
      ua.includes("slackbot") ||
      ua.includes("vkshare") ||
      ua.includes("w3c_validator") ||
      ua.includes("redditbot") ||
      ua.includes("applebot") ||
      ua.includes("discordbot") ||
      ua.includes("skypeuripreview") ||
      ua.includes("googlebot") ||
      ua.includes("bingbot") ||
      ua.includes("duckduckbot") ||
      ua.includes("feedfetcher")
    );
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

  function generateCrawlerHtml(meta: PageMeta): string {
    const imageType = meta.image.endsWith(".png") ? "image/png" : meta.image.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return `<!DOCTYPE html>
<html lang="hi" prefix="og: http://ogp.me/ns# article: http://ogp.me/ns/article#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  <link rel="canonical" href="${escapeHtml(meta.url)}" />

  <!-- WhatsApp & Facebook Open Graph -->
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

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@TrikalDarshan" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${escapeHtml(meta.image)}" />
  <meta name="twitter:image:src" content="${escapeHtml(meta.image)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(meta.title)}" />

  <!-- Search Engine Microdata -->
  <meta itemprop="name" content="${escapeHtml(meta.title)}" />
  <meta itemprop="description" content="${escapeHtml(meta.description)}" />
  <meta itemprop="image" content="${escapeHtml(meta.image)}" />
  <link rel="image_src" href="${escapeHtml(meta.image)}" />
</head>
<body style="font-family: sans-serif; padding: 24px; background: #ffffff; color: #111827; max-width: 800px; margin: 0 auto;">
  <article>
    <header>
      <h1 style="font-size: 24px; line-height: 1.4; margin-bottom: 12px;">${escapeHtml(meta.title)}</h1>
      ${meta.author ? `<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">लेखक / रिपोर्टर: ${escapeHtml(meta.author)}</p>` : ""}
    </header>
    <figure style="margin: 16px 0;">
      <img src="${escapeHtml(meta.image)}" alt="${escapeHtml(meta.title)}" style="max-width: 100%; height: auto; border-radius: 8px; display: block;" />
    </figure>
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">${escapeHtml(meta.description)}</p>
    <p style="margin-top: 24px;">
      <a href="${escapeHtml(meta.url)}" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        पूरा समाचार पढ़ने के लिए यहाँ क्लिक करें
      </a>
    </p>
  </article>
</body>
</html>`;
  }

  function injectMetaTags(html: string, meta: PageMeta): string {
    let cleaned = html
      .replace(/<title>[\s\S]*?<\/title>/gi, "")
      .replace(/<meta\s+[^>]*?(?:property|name|itemprop)=["'](?:og:|twitter:|article:|description|name|image)[^"']*["'][^>]*>/gi, "")
      .replace(/<link\s+[^>]*?rel=["'](?:canonical|image_src)["'][^>]*>/gi, "")
      .replace(/<meta\s+itemprop=["'][^"']*["'][^>]*>/gi, "");

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
      const userAgent = req.headers["user-agent"] || "";
      const isBot = isSocialCrawler(userAgent);
      let meta: PageMeta;

      // Check if it is an article page: /post/:idOrSlug, /article/:idOrSlug, /p/:idOrSlug, /n/:idOrSlug, /a/:idOrSlug, /news/:idOrSlug, /share/:idOrSlug
      const articleMatch = rawPath.match(/^\/(post|article|p|n|a|news|share)\/([^/]+)/i);
      if (articleMatch) {
        const idOrSlug = articleMatch[2];
        const cleanKey = (idOrSlug || "").replace(/\.(jpg|jpeg|png|webp|gif|html)$/i, "").trim();
        let decodedKey = cleanKey;
        try {
          decodedKey = decodeURIComponent(cleanKey);
        } catch {}

        let article = await findArticleAsync(cleanKey);
        if (!article && decodedKey !== cleanKey) {
          article = await findArticleAsync(decodedKey);
        }
        if (article) {
          const cleanSlugOrId = (article.slug && /^[a-zA-Z0-9_-]+$/.test(article.slug) && !article.slug.includes('%'))
            ? article.slug
            : article.id;
          const canonicalUrl = `${baseUrl}/post/${cleanSlugOrId}`;
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

          // If social bot (WhatsApp, Facebook, Twitter, Telegram, etc.), return dedicated clean Open Graph HTML immediately!
          if (isBot) {
            return res.status(200).set({
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "public, max-age=300, s-maxage=600"
            }).send(generateCrawlerHtml(meta));
          }
        } else {
          meta = {
            type: "website",
            title: "त्रिकाल दर्शन समाचार - सत्य की त्रिकाल दृष्टि",
            description: "भारत और आपके शहर की ताज़ा ख़बरें, स्थानीय समाचार, निष्पक्ष पत्रकारिता और Ground Report।",
            url: `${baseUrl}${rawPath}`,
            image: getSiteDefaultImage(baseUrl)
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
          image: getSiteDefaultImage(baseUrl)
        };
        if (isBot) {
          return res.status(200).set({
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=600"
          }).send(generateCrawlerHtml(meta));
        }
      } else {
        meta = {
          type: "website",
          title: "त्रिकाल दर्शन समाचार - सत्य की त्रिकाल दृष्टि | Trikal Darshan Samachar",
          description: "भारत और आपके शहर की ताज़ा ख़बरें, स्थानीय समाचार, निष्पक्ष पत्रकारिता और Ground Report। सत्य की त्रिकाल दृष्टि।",
          url: `${baseUrl}${rawPath}`,
          image: getSiteDefaultImage(baseUrl)
        };
        if (isBot) {
          return res.status(200).set({
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=600"
          }).send(generateCrawlerHtml(meta));
        }
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
