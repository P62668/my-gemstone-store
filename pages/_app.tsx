import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { LoadingProvider } from '../components/context/LoadingContext';
import GlobalLoadingIndicator from '../components/ui/GlobalLoadingIndicator';

// Import ApiLoadingSetup component
const ApiLoadingSetup = dynamic(() => import('../components/context/ApiLoadingSetup'), { ssr: false });

// Dynamically import context providers to reduce initial bundle size
const CartProvider = dynamic(() => import('../components/context/CartContext').then(mod => mod.CartProvider), { ssr: true });
const UserProvider = dynamic(() => import('../components/context/UserContext').then(mod => mod.UserProvider), { ssr: true });
const WishlistProvider = dynamic(() => import('../components/context/WishlistContext').then(mod => mod.WishlistProvider), { ssr: true });
const CouponProvider = dynamic(() => import('../components/context/CouponContext').then(mod => mod.CouponProvider), { ssr: true });
const LoyaltyProvider = dynamic(() => import('../components/context/LoyaltyContext').then(mod => mod.LoyaltyProvider), { ssr: true });

// Load Toaster dynamically on client only to avoid SSR issues
const Toaster = dynamic(() => import('react-hot-toast').then(mod => mod.Toaster), { ssr: false });

// Load non-critical CSS immediately for better UX
function loadNonCriticalCSS() {
  if (typeof window !== 'undefined') {
    // Determine which CSS files to load based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const cssPath = isProduction ? '/styles/optimized' : '/styles';
    
    // Create link element for non-critical CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${cssPath}/globals${isProduction ? '.min' : ''}.css`;
    link.media = 'all'; // Load immediately
    document.head.appendChild(link);
    
    // Also load luxury theme CSS
    const luxuryLink = document.createElement('link');
    luxuryLink.rel = 'stylesheet';
    luxuryLink.href = `${cssPath}/luxury-theme${isProduction ? '.min' : ''}.css`;
    luxuryLink.media = 'all'; // Load immediately
    document.head.appendChild(luxuryLink);
  }
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  
  // Prefetch common routes for faster navigation
  useEffect(() => {
    // Prefetch important pages
    const prefetchRoutes = [
      '/',
      '/shop',
      '/cart',
      '/wishlist',
      '/login',
      '/signup'
    ];
    
    // Use requestIdleCallback for non-critical prefetching
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        const prefetcher = document.createElement('link');
        prefetcher.rel = 'prefetch';
        prefetcher.as = 'document';
        
        prefetchRoutes.forEach(route => {
          prefetcher.href = route;
          document.head.appendChild(prefetcher.cloneNode(true));
        });
      });
    }
  }, []);

  // Load non-critical CSS after initial render
  useEffect(() => {
    // Load CSS immediately for better styling
    loadNonCriticalCSS();
  }, []);

  return (
    <SessionProvider session={session}>
      <LoadingProvider>
        {/* Initialize API loading indicators */}
        {typeof window !== 'undefined' && <ApiLoadingSetup />}
        <UserProvider>
          <CartProvider>
            <WishlistProvider>
              <LoyaltyProvider>
                <CouponProvider>
                  <GlobalLoadingIndicator />
                  <Component {...pageProps} />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: '#10b981',
                          secondary: '#fff',
                        },
                      },
                      error: {
                        duration: 5000,
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                </CouponProvider>
              </LoyaltyProvider>
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </LoadingProvider>
    </SessionProvider>
  );
}

export default MyApp;