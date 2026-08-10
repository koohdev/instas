export default function RenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: transparent; overflow: hidden; }
          
          /* Hide Next.js dev overlay indicator completely in screenshots */
          nextjs-portal,
          [data-nextjs-toast],
          [data-nextjs-dialog-overlay],
          #next-dev-overlay,
          div[class*="nextjs-toast"],
          div[class*="nextjs-portal"] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
