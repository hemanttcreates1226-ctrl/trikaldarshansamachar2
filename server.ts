import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
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

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "database.json");

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

async function startServer() {
  loadDatabaseFromDisk();

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

  // --- ARTICLES CRUD ---
  app.get("/api/articles", (req, res) => {
    res.json(inMemoryDb.news);
  });

  app.get("/api/articles/:idOrSlug", (req, res) => {
    const { idOrSlug } = req.params;
    const found = inMemoryDb.news.find((a: any) => a.id === idOrSlug || a.slug === idOrSlug);
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

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trikal Darshan Samachar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
