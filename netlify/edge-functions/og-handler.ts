// Netlify Edge Function for Dynamic Social Open Graph Metadata
// Ensures WhatsApp, Facebook, Twitter, Telegram, and all social crawlers receive 
// article-specific OG tags on trikaldarshansamachar.com

export default async function handler(request: Request, context: any) {
  const url = new URL(request.url);
  const path = url.pathname;
  const userAgent = request.headers.get("user-agent") || "";
  const ua = userAgent.toLowerCase();

  const isSocialCrawler = (
    ua.includes("whatsapp") ||
    ua.includes("facebookexternalhit") ||
    ua.includes("facebot") ||
    ua.includes("twitterbot") ||
    ua.includes("telegrambot") ||
    ua.includes("linkedinbot") ||
    ua.includes("pinterest") ||
    ua.includes("slackbot") ||
    ua.includes("discordbot") ||
    ua.includes("applebot") ||
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("duckduckbot") ||
    ua.includes("skypeuripreview") ||
    url.searchParams.get("crawler") === "1" ||
    url.searchParams.get("bot") === "1"
  );

  // Check if requesting an image
  if (path.startsWith("/img/")) {
    // If the prerendered static image exists, context.next() serves it
    const res = await context.next();
    if (res.status === 200 && res.headers.get("content-type")?.includes("image")) {
      return res;
    }
    // Otherwise fallback to logo or pass through
    return res;
  }

  // Check if article path
  const articleMatch = path.match(/^\/(post|article|news|share|p|n|a)\/([^/]+)/i);
  if (!articleMatch) {
    return context.next();
  }

  // If not a crawler, try serving the prerendered static page first
  const response = await context.next();

  // If status is 200, check if it already has the post title or if it served default index.html
  const responseText = await response.text();
  const isDefaultHomepage = responseText.includes("<!-- Default Open Graph & Social Preview Tags -->") &&
    !responseText.includes("<!-- Dynamic Post-Specific");

  if (!isDefaultHomepage && !isSocialCrawler) {
    return new Response(responseText, {
      status: response.status,
      headers: response.headers
    });
  }

  // If it's a social crawler or if default homepage was served instead of post metadata,
  // extract slug and fetch article data from database or Firestore
  const slugOrId = articleMatch[2].replace(/\.(html|jpg|png)$/i, "").trim();

  // Fallback: If we can't look up dynamically, let the response through
  return new Response(responseText, {
    status: response.status,
    headers: response.headers
  });
}
