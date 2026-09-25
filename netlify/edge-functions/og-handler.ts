// Netlify Edge Function for Dynamic Social Open Graph Metadata
// Ensures WhatsApp, Facebook, Twitter, Telegram, and all social crawlers receive 
// article-specific OG tags on trikaldarshansamachar.com

const FIRESTORE_PROJECT_ID = "gen-lang-client-0849958461";
const FIRESTORE_DATABASE_ID = "ai-studio-trikaldarshansam-e5ca51a3-580f-4c3d-b521-c6e69d61f699";
const BASE_FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents`;
const CANONICAL_DOMAIN = "https://trikaldarshansamachar.com";

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

function parseFirestoreFields(fieldsObj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  if (!fieldsObj) return result;
  for (const [key, val] of Object.entries(fieldsObj)) {
    if (val.stringValue !== undefined) result[key] = val.stringValue;
    else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
    else if (val.integerValue !== undefined) result[key] = Number(val.integerValue);
    else if (val.doubleValue !== undefined) result[key] = Number(val.doubleValue);
    else if (val.arrayValue !== undefined) {
      result[key] = Array.isArray(val.arrayValue.values)
        ? val.arrayValue.values.map((v: any) => v.stringValue ?? v)
        : [];
    }
  }
  return result;
}

async function fetchArticleFromFirestore(slugOrId: string): Promise<any | null> {
  const clean = slugOrId.trim();
  if (!clean) return null;

  // 1. Try direct document get by ID
  try {
    const directRes = await fetch(`${BASE_FIRESTORE_URL}/news/${encodeURIComponent(clean)}`);
    if (directRes.ok) {
      const doc = await directRes.json();
      if (doc && doc.fields) {
        return parseFirestoreFields(doc.fields);
      }
    }
  } catch {}

  // 2. Query by slug
  try {
    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: "news" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "slug" },
            op: "EQUAL",
            value: { stringValue: clean }
          }
        },
        limit: 1
      }
    };

    const queryRes = await fetch(`${BASE_FIRESTORE_URL}:runQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryPayload)
    });

    if (queryRes.ok) {
      const results = await queryRes.json();
      if (Array.isArray(results) && results.length > 0 && results[0].document?.fields) {
        return parseFirestoreFields(results[0].document.fields);
      }
    }
  } catch {}

  return null;
}

function generateNotFoundHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>समाचार नहीं मिला | त्रिकाल दर्शन समाचार</title>
  <meta name="robots" content="noindex, nofollow" />
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 48px 20px; background: #f9fafb; color: #111827;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h1 style="font-size: 22px; color: #dc2626; margin-bottom: 12px;">समाचार उपलब्ध नहीं है</h1>
    <p style="color: #4b5563; font-size: 15px; margin-bottom: 24px;">यह समाचार हटा दिया गया है या इसका लिंक अमान्य है।</p>
    <a href="${escapeHtml(baseUrl)}/" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
      त्रिकाल दर्शन समाचार के मुखपृष्ठ पर जाएँ
    </a>
  </div>
</body>
</html>`;
}

function injectMetaTags(html: string, meta: {
  title: string;
  postTitle: string;
  description: string;
  url: string;
  image: string;
  author: string;
  publishedTime: string;
  section: string;
}): string {
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
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="त्रिकाल दर्शन समाचार" />
    <meta property="og:title" content="${escapeHtml(meta.postTitle)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
    <meta property="og:image" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:type" content="${imageType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(meta.postTitle)}" />
    <meta property="og:locale" content="hi_IN" />
    <meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />
    <meta property="article:author" content="${escapeHtml(meta.author)}" />
    <meta property="article:section" content="${escapeHtml(meta.section)}" />

    <!-- Twitter / X Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@TrikalDarshan" />
    <meta name="twitter:title" content="${escapeHtml(meta.postTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />
    <meta name="twitter:image:src" content="${escapeHtml(meta.image)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(meta.postTitle)}" />
`;

  if (cleaned.includes("<head>")) {
    return cleaned.replace("<head>", `<head>\n${metaBlock}`);
  }
  return `${metaBlock}\n${cleaned}`;
}

export default async function handler(request: Request, context: any) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 1. Check image endpoint: /img/:idOrSlug
  if (path.startsWith("/img/")) {
    const res = await context.next();
    const contentType = res.headers.get("content-type") || "";
    if (res.status === 200 && contentType.includes("image")) {
      return res;
    }

    // Dynamic resolution for /img/:key.jpg
    const key = path.replace("/img/", "").replace(/\.(jpg|jpeg|png|webp)$/i, "").trim();
    if (key) {
      const article = await fetchArticleFromFirestore(key);
      if (article && article.featuredImage && typeof article.featuredImage === "string") {
        const feat = article.featuredImage.trim();
        if (feat.startsWith("data:") || feat.length > 50 && !feat.startsWith("http")) {
          let base64Data = feat;
          let mime = "image/jpeg";
          const m = feat.match(/^data:([^;]+);base64,(.+)$/s);
          if (m) {
            mime = m[1];
            base64Data = m[2];
          }
          try {
            const binStr = atob(base64Data);
            const len = binStr.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binStr.charCodeAt(i);
            }
            return new Response(bytes, {
              status: 200,
              headers: {
                "Content-Type": mime,
                "Cache-Control": "public, max-age=86400, s-maxage=604800",
                "Access-Control-Allow-Origin": "*"
              }
            });
          } catch {}
        } else if (feat.startsWith("http://") || feat.startsWith("https://")) {
          return Response.redirect(feat, 302);
        }
      }
    }

    return Response.redirect(`${CANONICAL_DOMAIN}/logo.png`, 302);
  }

  // 2. Check article route: /post/:slug, /article/:slug, /news/:slug, /share/:slug
  const articleMatch = path.match(/^\/(post|article|news|share|p|n|a)\/([^/]+)/i);
  if (!articleMatch) {
    return context.next();
  }

  // Check if static prerendered HTML exists
  const response = await context.next();
  const responseText = await response.text();

  // If already prerendered with dynamic article tags, return immediately for both crawler & browser
  if (responseText.includes("<!-- Dynamic Post-Specific") || (!responseText.includes("<!-- Default Open Graph & Social Preview Tags -->") && response.status === 200)) {
    return new Response(responseText, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600"
      }
    });
  }

  // Otherwise default homepage was returned by SPA fallback -> Lookup article dynamically
  const slugOrId = articleMatch[2].replace(/\.(html|jpg|png)$/i, "").trim();
  const article = await fetchArticleFromFirestore(slugOrId);

  // If article not found, NEVER return homepage metadata! Return 404
  if (!article) {
    return new Response(generateNotFoundHtml(CANONICAL_DOMAIN), {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  }

  const rawTitle = (article.title || "").trim();
  const articleTitle = rawTitle ? `${rawTitle} | त्रिकाल दर्शन समाचार` : "त्रिकाल दर्शन समाचार";
  const cleanSlug = article.slug && /^[a-zA-Z0-9_-]+$/.test(article.slug) ? article.slug : (article.id || slugOrId);
  const canonicalUrl = `${CANONICAL_DOMAIN}/post/${cleanSlug}`;
  const absImageUrl = `${CANONICAL_DOMAIN}/img/${cleanSlug}.jpg`;
  const description = cleanPlainText(article.subtitle || article.summary || article.content, 180) ||
    "सत्य की त्रिकाल दृष्टि - पढ़ें पूरी खबर त्रिकाल दर्शन समाचार पर।";

  const meta = {
    title: articleTitle,
    postTitle: rawTitle || articleTitle,
    description,
    url: canonicalUrl,
    image: absImageUrl,
    author: article.authorName || article.reporterName || "त्रिकाल दर्शन समाचार",
    publishedTime: article.publishDate || new Date().toISOString(),
    section: article.categoryName || "समाचार"
  };

  const finalHtml = injectMetaTags(responseText, meta);
  return new Response(finalHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300"
    }
  });
}
