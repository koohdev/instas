/**
 * Utility for parsing and extracting clean URLs from CSV, TXT, JSON, or pasted text.
 * Automatically strips tracking parameters (utm_*, ref, fbclid, etc.) and deduplicates entries.
 */

export function sanitizeSingleUrl(rawUrl: string): string {
  try {
    let clean = rawUrl.trim();
    if (!clean) return "";

    // Prepend protocol if missing
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }

    const parsed = new URL(clean);
    // List of tracking query parameter prefixes/names to strip
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "utm_id",
      "fbclid",
      "gclid",
      "msclkid",
      "ref",
      "ref_src",
      "tblci",
    ];

    trackingParams.forEach((param) => {
      parsed.searchParams.delete(param);
    });

    return parsed.toString();
  } catch {
    return rawUrl.trim();
  }
}

export function parseBulkUrlText(textContent: string): string[] {
  if (!textContent || !textContent.trim()) return [];

  // Match URLs or line breaks
  const urlRegex = /(https?:\/\/[^\s,;"']+|www\.[^\s,;"']+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s,;"']*)/gi;
  const matches = textContent.match(urlRegex) || [];

  const cleanList: string[] = [];
  const seen = new Set<string>();

  matches.forEach((raw) => {
    const clean = sanitizeSingleUrl(raw);
    if (clean && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      cleanList.push(clean);
    }
  });

  return cleanList;
}

export async function parseImportedFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const urls = parseBulkUrlText(text);
        resolve(urls);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
