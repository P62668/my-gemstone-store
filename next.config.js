/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
  reactStrictMode: true,
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Fix for webpack hot update issues
  webpack: (config, { dev, isServer }) => {
    // Fix for server-side polyfills
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        self: false,
        global: false,
        process: false,
      };
    } else {
      // Client-side polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: false,
        util: false,
        buffer: false,
        stream: false,
        crypto: false,
        fs: false,
        path: false,
        os: false,
      };
    }

    // Fix for webpack hot update issues
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.next', '**/.git'],
      };
    }

    return config;
  },
  // Fix for CORS issues in development
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
