import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Disable Strict Mode to prevent Agora UID_CONFLICT errors caused by
  // React's double-mount behavior in development.
  reactStrictMode: false,

  // Remove the X-Powered-By header to reduce response size and avoid leaking framework info.
  poweredByHeader: false,

  // Enable gzip/brotli compression on Vercel serverless responses.
  compress: true,

  experimental: {
    reactCompiler: true,
    serverActions: {
      allowedOrigins: ['localhost:9002', '*.vercel.app'],
    },
    // Pre-compile these routes at dev server startup to avoid first-visit delay
    preloadEntriesOnStart: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Serve modern image formats automatically — AVIF is ~50% smaller than JPEG.
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images for 7 days on Vercel's CDN.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dzfgdbupfqgijtnziukd.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
