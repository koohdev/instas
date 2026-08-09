/**
 * Sanitize scraped title and description for carousel display.
 */

const FILLER_PHRASES = [
  /\b(best|top|ultimate|comprehensive|complete guide to|everything you need to know|#\d+)\b/gi,
  /\b(seo|search engine optimization)\b/gi,
];

export function sanitizeTitle(raw: string): string {
  let t = raw.trim();
  if (!t) return "";

  // Extract strictly the first word / brand name token before space, dash (-/—/–), pipe (|), colon (:), slash (/), or dot (.)
  const firstWordMatch = t.match(/^[^\s\-—–|:\/\.]+/);
  if (firstWordMatch && firstWordMatch[0]) {
    return firstWordMatch[0].trim();
  }

  // Fallback: split by space and take first token
  const parts = t.split(/\s+/);
  return parts[0] || t;
}

export function sanitizeDescription(raw: string): string {
  let d = raw.trim();
  for (const re of FILLER_PHRASES) d = d.replace(re, "").trim();
  // Truncate at word boundary ~150 chars
  if (d.length > 150) {
    d = d.slice(0, 150);
    const lastSpace = d.lastIndexOf(" ");
    if (lastSpace > 80) d = d.slice(0, lastSpace);
    d = d + "…";
  }
  return d;
}
