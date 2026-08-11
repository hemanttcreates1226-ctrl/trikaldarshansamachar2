import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      appName: "Trikal Darshan Samachar",
      timestamp: new Date().toISOString()
    });
  });

  // Admin authentication endpoint
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    // Default admin credentials check
    if (
      (username === "admin" && password === "trikal123") ||
      (username === "trikaldarshannews72@gmail.com" && password === "admin123")
    ) {
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
      message: "अमान्य उपयोगकर्ता नाम या पासवर्ड! (Demo credentials: username: admin, pass: trikal123)"
    });
  });

  // Public verification endpoint for Press ID Cards
  app.get("/api/verify-press-id/:pressId", (req, res) => {
    const { pressId } = req.params;
    res.json({
      pressId,
      verified: true,
      organization: "त्रिकाल दर्शन समाचार",
      tagline: "सत्य की त्रिकाल दृष्टि",
      verificationUrl: `${process.env.APP_URL || ''}/verify/${pressId}`
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
