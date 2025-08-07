import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/images/logo-shankar.png" type="image/png" />
        <link rel="shortcut icon" href="/images/logo-shankar.png" type="image/png" />
        <meta
          name="description"
          content="Discover the finest gemstones from Shankarmala heritage jewelry collection."
        />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Shankarmala" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@shankarmala" />

        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#f59e0b" />
        <meta name="msapplication-TileColor" content="#f59e0b" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // Polyfill for process object
                window.process = window.process || { env: {} };
                
                // Polyfill for global object
                window.global = window.global || window;
                
                // Polyfill for __webpack_require__.g
                if (typeof __webpack_require__ !== 'undefined') {
                  __webpack_require__.g = __webpack_require__.g || window;
                }
                
                // Polyfill for global process
                if (typeof global !== 'undefined') {
                  global.process = global.process || { env: {} };
                }
                
                // Ensure process is available globally
                if (typeof process === 'undefined') {
                  window.process = { env: {} };
                }
              }
            `,
          }}
        />
      </body>
    </Html>
  );
}
