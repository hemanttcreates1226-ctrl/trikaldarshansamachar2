import fs from "fs";
import path from "path";
import {
  resolveArticleImageUrl,
  extractArticleRawImage,
  PUBLIC_CANONICAL_DOMAIN
} from "../src/lib/slugHelper";

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

function injectMetaTags(html: string, meta: {
  title: string;
  description: string;
  url: string;
  image: string;
  author: string;
  publishedTime: string;
  section: string;
}): string {
  // Completely purge all default/homepage meta tags
  let cleaned = html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+[^>]*?(?:property|name|itemprop)=["'](?:og:|twitter:|article:|description|name|image)[^"']*["'][^>]*>/gi, "")
    .replace(/<link\s+[^>]*?rel=["'](?:canonical|image_src)["'][^>]*>/gi, "")
    .replace(/<meta\s+itemprop=["'][^"']*["'][^>]*>/gi, "");

  const imageType = meta.image.endsWith(".png") ? "image/png" : meta.image.endsWith(".webp") ? "image/webp" : "image/jpeg";

  const metaBlock = `
    <!-- Dynamic Post-Specific Social & Open Graph Metadata -->
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${escapeHtml(meta.url)}" />

    <!-- Open Graph / WhatsApp Preview Tags -->
    <meta property="og:type" content="article" />
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
    <meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />
    <meta property="article:author" content="${escapeHtml(meta.author)}" />
    <meta property="article:section" content="${escapeHtml(meta.section)}" />

    <!-- Twitter / X Card Tags -->
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
`;

  if (cleaned.includes("<head>")) {
    return cleaned.replace("<head>", `<head>\n${metaBlock}`);
  }
  return `${metaBlock}\n${cleaned}`;
}

async function runPrerender() {
  const distDir = path.join(process.cwd(), "dist");
  const templatePath = path.join(distDir, "index.html");

  if (!fs.existsSync(templatePath)) {
    console.warn("[Prerender] dist/index.html not found, skipping prerender.");
    return;
  }

  const templateHtml = fs.readFileSync(templatePath, "utf-8");
  const dbFile = path.join(process.cwd(), "data", "database.json");

  if (!fs.existsSync(dbFile)) {
    console.warn("[Prerender] data/database.json not found, skipping.");
    return;
  }

  const db = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
  const articles: any[] = Array.isArray(db.news) ? db.news : [];

  const imgDistDir = path.join(distDir, "img");
  fs.mkdirSync(imgDistDir, { recursive: true });

  const logoSrc = path.join(process.cwd(), "public", "logo.png");
  const logoDest = path.join(distDir, "logo.png");
  if (fs.existsSync(logoSrc) && !fs.existsSync(logoDest)) {
    fs.copyFileSync(logoSrc, logoDest);
  }

  let count = 0;
  for (const article of articles) {
    if (!article || (!article.id && !article.slug)) continue;

    const postTitle = article.title ? article.title.trim() : "त्रिकाल दर्शन समाचार";
    const fullTitle = article.title ? `${postTitle} | त्रिकाल दर्शन समाचार` : "त्रिकाल दर्शन समाचार";
    const postDescription = cleanPlainText(
      article.subtitle || article.summary || article.content,
      180
    ) || "सत्य की त्रिकाल दृष्टि - पढ़ें पूरी खबर त्रिकाल दर्शन समाचार पर।";

    const cleanSlug = (article.slug && /^[a-zA-Z0-9_-]+$/.test(article.slug) && !article.slug.includes('%'))
      ? article.slug
      : article.id;

    const postUrl = `${PUBLIC_CANONICAL_DOMAIN}/post/${cleanSlug}`;
    const absImageUrl = resolveArticleImageUrl(article, PUBLIC_CANONICAL_DOMAIN);

    const meta = {
      title: fullTitle,
      description: postDescription,
      url: postUrl,
      image: absImageUrl,
      author: article.authorName || article.reporterName || "त्रिकाल दर्शन समाचार",
      publishedTime: article.publishDate || new Date().toISOString(),
      section: article.categoryName || "समाचार"
    };

    // Extract raw image and save binary image in dist/img/ if base64
    const rawImg = extractArticleRawImage(article);
    if (rawImg && typeof rawImg === "string") {
      const trimmed = rawImg.trim();
      if (
        trimmed.startsWith("data:") ||
        (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/") && trimmed.length > 50)
      ) {
        let base64Data = trimmed;
        const m = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
        if (m) base64Data = m[2];
        try {
          const buf = Buffer.from(base64Data, "base64");
          if (buf.length > 0) {
            if (cleanSlug) fs.writeFileSync(path.join(imgDistDir, `${cleanSlug}.jpg`), buf);
            if (article.id) fs.writeFileSync(path.join(imgDistDir, `${article.id}.jpg`), buf);
            if (article.slug && article.slug !== cleanSlug) {
              try {
                fs.writeFileSync(path.join(imgDistDir, `${article.slug}.jpg`), buf);
              } catch {}
            }
          }
        } catch (e) {
          console.warn(`[Prerender Image] Failed to write image for ${article.id}:`, e);
        }
      }
    }

    const postHtml = injectMetaTags(templateHtml, meta);

    // Write to paths:
    // /post/[slug]/index.html and /post/[slug].html
    const routesToWrite = new Set<string>();
    const safeAdd = (base: string, segment: string) => {
      if (!segment) return;
      // Truncate segment to 80 chars if too long to prevent OS ENAMETOOLONG
      const safeSegment = Buffer.byteLength(segment, 'utf8') > 120 
        ? segment.slice(0, 40) 
        : segment;
      routesToWrite.add(path.join(distDir, base, safeSegment));
    };

    if (cleanSlug) {
      safeAdd("post", cleanSlug);
      safeAdd("article", cleanSlug);
      safeAdd("news", cleanSlug);
    }
    if (article.id) {
      safeAdd("post", article.id);
      safeAdd("article", article.id);
      safeAdd("news", article.id);
    }
    if (article.slug && article.slug !== cleanSlug) {
      safeAdd("post", article.slug);
      safeAdd("article", article.slug);
      safeAdd("news", article.slug);
    }

    for (const rPath of routesToWrite) {
      try {
        fs.mkdirSync(rPath, { recursive: true });
        fs.writeFileSync(path.join(rPath, "index.html"), postHtml, "utf-8");
        // Also write .html if safe
        if (!rPath.endsWith(".html")) {
          try {
            fs.writeFileSync(`${rPath}.html`, postHtml, "utf-8");
          } catch {}
        }
      } catch (e) {
        // Safe fallback
      }
    }

    count++;
  }

  console.log(`[Prerender] Successfully generated static pages and images for ${count} articles.`);
}

runPrerender().catch((err) => {
  console.error("[Prerender Error]", err);
  process.exit(1);
});
