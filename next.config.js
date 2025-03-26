/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'skrbl-ai.firebaseapp.com'],
  },
  trailingSlash: false,
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;