/** @type {import('next').NextConfig} */

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Only enforce required env vars in production, not during builds
if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.warn(`Warning: Missing environment variable: ${envVar}`);
      // Don't throw error during build, just warn
    }
  });
}

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
  // output: 'standalone', // Temporarily disabled to fix API route build issues
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
  async redirects() {
    return [
      // Legacy agent redirects
      { source: '/social-media', destination: '/services/socialnino', permanent: true },
      { source: '/branding', destination: '/services/branding', permanent: true },
      { source: '/book-publishing', destination: '/services/book-publishing', permanent: true },
      { source: '/agent-backstory/:agentId', destination: '/services/:agentId', permanent: true },
      { source: '/chat/:agentId', destination: '/services/:agentId', permanent: true },

      // Services → Agents migration
      { source: '/services', destination: '/agents', permanent: true },
      { source: '/services/:id', destination: '/agents/:id', permanent: true },

      // Existing auth redirects
      { source: '/sign-in', destination: '/dashboard', permanent: false },
      { source: '/sign-up', destination: '/dashboard', permanent: false },
      { source: '/auth', destination: '/dashboard', permanent: false },
      { source: '/login', destination: '/dashboard', permanent: false },
    ];
  },
};

module.exports = nextConfig;