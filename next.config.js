/** @type {import('next').NextConfig} */

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

if (process.env.NODE_ENV !== 'test') {
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });
}

const nextConfig = {
  reactStrictMode: true,

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
    ignoreDuringBuilds: false
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
};

module.exports = nextConfig;