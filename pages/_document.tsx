import Document, { Html, Head, Main, NextScript } from 'next/document';
import fs from 'fs';
import path from 'path';

class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    // Read critical CSS file
    let criticalCSS = '';
    try {
      const criticalCSSPath = path.join(process.cwd(), 'styles', 'critical.min.css');
      criticalCSS = fs.readFileSync(criticalCSSPath, 'utf8');
    } catch (error) {
      console.error('Error reading critical CSS:', error);
    }

    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/images/logo-shankar.png" type="image/png" />
          <link rel="shortcut icon" href="/images/logo-shankar.png" type="image/png" />
          <meta name="description" content="Discover the finest gemstones from Shankarmala heritage jewelry collection." />
          
          {/* Preconnect to critical domains */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://res.cloudinary.com" />
          
          {/* Google Fonts */}
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
          
          {/* DNS prefetch for third-party services */}
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
          
          {/* Critical CSS for above-the-fold content */}
          {criticalCSS && (
            <style
              id="critical-css"
              dangerouslySetInnerHTML={{ __html: criticalCSS }}
            />
          )}
          
          {/* Meta tags */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Shankarmala" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@shankarmala" />
          <meta name="theme-color" content="#f59e0b" />
          <meta name="msapplication-TileColor" content="#f59e0b" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;