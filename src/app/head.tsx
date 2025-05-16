export default function Head() {
    return (
      <>
        <meta charSet="utf-8" />
        <title>Overtime Calculator</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta
          name="description"
          content="Calculate your minimum end time including lunch and overtime, with a cute bear & cat assistant!"
        />
  
        {/* Theme colors */}
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0a0a0a"
          media="(prefers-color-scheme: dark)"
        />
  
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
  
        {/* Social sharing */}
        <meta property="og:title" content="Overtime Calculator" />
        <meta
          property="og:description"
          content="Calculate when you hit overtime—with lunch break built-in!"
        />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </>
    );
  }
  