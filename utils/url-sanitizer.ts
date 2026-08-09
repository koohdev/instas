export function sanitizeUrls(urlsText: string): string {
  if (!urlsText.trim()) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = urlsText.match(urlRegex) || [];
  
  const cleaned = matches.map((u) => {
    try {
      const parsed = new URL(u.trim());
      const trackingParams = [
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "ref", "fbclid", "gclid", "igshid", "mc_cid", "mc_eid"
      ];
      trackingParams.forEach((param) => parsed.searchParams.delete(param));
      return parsed.toString();
    } catch {
      return u.trim();
    }
  });

  const unique = Array.from(new Set(cleaned)).filter(Boolean);
  return unique.join("\n");
}
