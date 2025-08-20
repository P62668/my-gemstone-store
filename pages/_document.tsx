import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/images/logo-shankar.png" type="image/png" />
          <link rel="shortcut icon" href="/images/logo-shankar.png" type="image/png" />
          <meta name="description" content="Discover the finest gemstones from Shankarmala heritage jewelry collection." />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
