import type { AppProps } from 'next/app';
import type { ComponentType } from 'react';
import '../styles/globals.css';
import { CartProvider } from '../components/context/CartContext';
import { UserProvider } from '../components/context/UserContext';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';

// Global polyfills for browser compatibility
if (typeof window !== 'undefined') {
  // Polyfill for process object
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  }

  // Polyfill for global object
  if (!(window as any).global) {
    (window as any).global = window;
  }
}

function App({ Component, pageProps }: AppProps) {
  const PageComponent = Component as ComponentType<any>;
  return (
    <>
      <Head>
        <link rel="icon" href="/images/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <UserProvider>
        <CartProvider>
          <PageComponent {...pageProps} />
        </CartProvider>
      </UserProvider>
    </>
  );
}

export default App;
