/** @type {import('next').NextConfig} */


const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'], // Exclude archived-app pages
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'railway.app',
      'zpqavydsinrtaxhowmnb.supabase.co'
    ],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_RAILWAY_ENV: process.env.NEXT_PUBLIC_RAILWAY_ENV
  },
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: true // Temporarily ignore ESLint during builds
  },
  transpilePackages: ['@stripe/stripe-js', 'framer-motion'],
  trailingSlash: false,
  output: 'standalone',
  distDir: '.next',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        tty: false
      };
    }
    config.module = {
      ...config.module,
      exprContextCritical: false
    };
    return config;
  },
  productionBrowserSourceMaps: true, // Enable source maps for debugging
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy agent redirects - Updated to point to /agents
      { source: '/social-media', destination: '/agents/socialnino', permanent: true },
      { source: '/branding', destination: '/agents/branding', permanent: true },
      { source: '/book-publishing', destination: '/agents/book-publishing', permanent: true },
      { source: '/agent-backstory/:agentId', destination: '/agents/:agentId', permanent: true },
      { source: '/chat/:agentId', destination: '/agents/:agentId', permanent: true },

      // Canonical agent backstory routing - 308 redirects
      { source: '/agentbackstory/:slug*', destination: '/agents/:slug*', permanent: true },
      { source: '/services/:slug*', destination: '/agents/:slug*', permanent: true },
      { source: '/agents/:slug/backstory', destination: '/agents/:slug', permanent: true },

      // Services → Agents migration - ACTIVE (keeping existing for compatibility)
      { source: '/services', destination: '/agents', permanent: true },

      // Removed auth redirects to allow actual auth pages to render
    ];
  },
};

module.exports = nextConfig;