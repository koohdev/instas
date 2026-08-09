import { getRenderData } from "@/lib/renderStore";
import type { CompositeParams } from "@/lib/compositor";

interface PageProps {
  searchParams: Promise<{ id?: string; data?: string }>;
}

/**
 * Build a @font-face CSS block for a custom font family.
 * We try all common formats; the browser will pick the first it can load.
 */
function buildFontFaceCSS(fontFamily: string, baseOrigin: string): string {
  const encodedFamily = encodeURIComponent(fontFamily);
  const apiUrl = `${baseOrigin}/api/fonts/${encodedFamily}`;
  return `
@font-face {
  font-family: '${fontFamily}';
  src: url('${apiUrl}') format('woff2'),
       url('${apiUrl}') format('truetype'),
       url('${apiUrl}') format('woff');
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
}
`.trim();
}

export default async function RenderPage({ searchParams }: PageProps) {
  const { id, data } = await searchParams;
  let params: CompositeParams | null = null;

  if (id) {
    params = getRenderData(id) as CompositeParams | null;
  } else if (data) {
    try {
      params = JSON.parse(decodeURIComponent(data));
    } catch {
      params = null;
    }
  }

  if (!params) {
    return (
      <html>
        <body style={{ background: "#000", color: "#fff", padding: 20 }}>
          No render params found.
        </body>
      </html>
    );
  }

  const fontFamily = params.fontFamily;
  const isCustomFont = fontFamily && !["Inter", "Roboto", "Outfit", "Plus Jakarta Sans"].includes(fontFamily);

  // We use an absolute URL so Playwright (which uses localhost) can fetch fonts
  const baseOrigin = `http://localhost:${process.env.PORT || 3000}`;
  const fontFaceCSS = isCustomFont ? buildFontFaceCSS(fontFamily!, baseOrigin) : "";

  const slide = params.type === "cover" ? (
    <CoverSlide {...params} />
  ) : (
    <ContentSlide {...params} />
  );

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        {/* System font preload */}
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0d0d0d; overflow: hidden; }
          ${fontFaceCSS}
        `}</style>
      </head>
      <body>{slide}</body>
    </html>
  );
}

/* ─────────────────────────── SHARED NOISE OVERLAY ─────────────────────────── */
function NoiseOverlay({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
        pointerEvents: "none",
        zIndex: 10,
        mixBlendMode: "overlay",
      }}
    />
  );
}

/* ─────────────────────────── RENDER ICON (inline SVG) ─────────────────────────── */
function RenderIcon({ icon, size = 22 }: { icon?: string; size?: number }) {
  switch (icon) {
    case "bookmark":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
      );
    case "send":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
        </svg>
      );
    case "sparkles":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "tag":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
      );
    default:
      // Fallback: always render bookmark
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      );
  }
}

/* ─────────────────────────── 4-CORNER BRANDING ─────────────────────────── */
function Branding(p: {
  topLeftText?: string;
  topRightText?: string;
  bottomLeftText?: string;
  bottomRightText?: string;
  bottomRightIcon?: string;
  slideNumber?: number;
  fontFamily?: string;
}) {
  const font = p.fontFamily
    ? `'${p.fontFamily}', 'Space Grotesk', sans-serif`
    : "'Space Grotesk', sans-serif";

  const bLeft = p.slideNumber
    ? String(p.slideNumber).padStart(2, "0")
    : p.bottomLeftText || "";

  return (
    <>
      {p.topLeftText && (
        <div style={{ position: "absolute", top: 48, left: 56, fontFamily: font, fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em", zIndex: 20 }}>
          {p.topLeftText}
        </div>
      )}
      {p.topRightText && (
        <div style={{ position: "absolute", top: 48, right: 56, fontFamily: font, fontWeight: 600, fontSize: 20, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", textTransform: "uppercase", zIndex: 20 }}>
          {p.topRightText}
        </div>
      )}
      {bLeft && (
        <div style={{ position: "absolute", bottom: 48, left: 56, fontFamily: font, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em", zIndex: 20 }}>
          {bLeft}
        </div>
      )}
      {/* Bottom right: always render text + icon together */}
      <div style={{ position: "absolute", bottom: 48, right: 56, fontFamily: font, fontWeight: 500, fontSize: 20, color: "rgba(255,255,255,0.65)", letterSpacing: "0.04em", zIndex: 20, display: "flex", alignItems: "center", gap: 10 }}>
        {p.bottomRightText && <span>{p.bottomRightText}</span>}
        <RenderIcon icon={p.bottomRightIcon || "bookmark"} size={22} />
      </div>
    </>
  );
}

/* ─────────────────────────── COVER SLIDE ─────────────────────────── */
function CoverSlide(p: CompositeParams) {
  const font = p.fontFamily
    ? `'${p.fontFamily}', 'Space Grotesk', sans-serif`
    : "'Space Grotesk', sans-serif";

  const isCustomBg = p.bgType === "custom" || Boolean(p.customBgImage);
  const customBgUrl = p.customBgImage
    ? (p.customBgImage.startsWith("http") || p.customBgImage.startsWith("data:") || p.customBgImage.startsWith("/"))
      ? p.customBgImage
      : `/api/backgrounds/${encodeURIComponent(p.customBgImage)}`
    : "";

  return (
    <div style={{ width: 1080, height: 1350, background: "#0d0d0d", position: "relative", overflow: "hidden", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {isCustomBg && customBgUrl ? (
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${customBgUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
      ) : (
        <>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)" }} />
          <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(120,80,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        </>
      )}

      {isCustomBg && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.4)", zIndex: 1 }} />
      )}

      <div style={{ textAlign: "center", padding: "0 80px", zIndex: 5 }}>
        <h1 style={{ fontFamily: font, fontWeight: 800, fontSize: 96, lineHeight: 1.05, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
          {p.coverTitle || "Your Title Here"}
        </h1>
        {p.coverSubtitle && (
          <p style={{ fontFamily: font, fontWeight: 400, fontSize: 36, color: "rgba(255,255,255,0.6)", marginTop: 32, lineHeight: 1.4, letterSpacing: "0.01em" }}>
            {p.coverSubtitle}
          </p>
        )}
      </div>

      <NoiseOverlay opacity={p.noiseOpacity} />
      <Branding {...p} />
    </div>
  );
}

/* ─────────────────────────── CONTENT SLIDE ─────────────────────────── */
function ContentSlide(p: CompositeParams) {
  const font = p.fontFamily
    ? `'${p.fontFamily}', 'Space Grotesk', sans-serif`
    : "'Space Grotesk', sans-serif";

  const shadow = p.dropShadow
    ? "0 32px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)"
    : "none";

  const hasScreenshot = Boolean(p.screenshotBase64 && p.screenshotBase64.length > 50);

  const isCustomBg = p.bgType === "custom" || Boolean(p.customBgImage);
  const customBgUrl = p.customBgImage
    ? (p.customBgImage.startsWith("http") || p.customBgImage.startsWith("data:") || p.customBgImage.startsWith("/"))
      ? p.customBgImage
      : `/api/backgrounds/${encodeURIComponent(p.customBgImage)}`
    : "";

  const sTop = p.screenshotTop ?? 240;
  const sHeight = p.screenshotHeight ?? 520;
  const tTop = p.titleTop ?? 790;
  const subTop = p.subtitleTop ?? 854;
  const pillTop = p.urlPillTop ?? 940;

  const screenshotSrc = p.screenshotBase64?.startsWith("data:")
    ? p.screenshotBase64
    : `data:image/jpeg;base64,${p.screenshotBase64}`;

  const blurredBgStyle = hasScreenshot
    ? `url("${screenshotSrc}")`
    : "linear-gradient(135deg,#1a1a2e,#16213e)";

  return (
    <div style={{ width: 1080, height: 1350, background: "#0d0d0d", position: "relative", overflow: "hidden", fontFamily: font }}>
      {isCustomBg && customBgUrl ? (
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${customBgUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
      ) : p.showBlurredBg && hasScreenshot ? (
        <div style={{ position: "absolute", inset: -40, backgroundImage: blurredBgStyle, backgroundSize: "cover", backgroundPosition: "center top", filter: `blur(${p.blurAmount}px) brightness(0.3) saturate(0.6)`, transform: "scale(1.1)" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #0d0d0d 0%, #161626 50%, #0d0d0d 100%)" }} />
      )}

      <div style={{ position: "absolute", inset: 0, background: isCustomBg ? "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.85) 100%)" : "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.8) 100%)" }} />

      {/* Screenshot card */}
      <div style={{ position: "absolute", top: sTop, left: 80, width: 920, height: sHeight, zIndex: 5, borderRadius: `${p.borderRadius}px`, overflow: "hidden", boxShadow: shadow, background: "rgba(255,255,255,0.04)" }}>
        {hasScreenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshotSrc}
            decoding="sync"
            loading="eager"
            alt="Website screenshot"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 24, fontWeight: 500 }}>
            No Preview Available
          </div>
        )}
      </div>

      {/* Site title */}
      <h2 style={{ position: "absolute", top: tTop, left: 80, width: 920, height: 50, zIndex: 5, fontFamily: font, fontWeight: 700, fontSize: 44, color: "#ffffff", margin: 0, lineHeight: "50px", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {p.siteTitle || "Site Title"}
      </h2>

      {/* Description */}
      {p.siteDescription && (
        <p style={{ position: "absolute", top: subTop, left: 80, width: 920, height: 74, zIndex: 5, fontFamily: font, fontWeight: 400, fontSize: 24, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: "36px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {p.siteDescription}
        </p>
      )}

      {/* URL pill */}
      {p.siteUrl && (
        <div style={{ position: "absolute", top: pillTop, left: 80, width: 920, height: 54, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 36px", borderRadius: 40, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "#ffffff", fontFamily: font, fontSize: 20, fontWeight: 600, letterSpacing: "0.01em", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
            {p.siteUrl}
          </div>
        </div>
      )}

      <NoiseOverlay opacity={p.noiseOpacity} />
      <Branding {...p} />
    </div>
  );
}
