/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig; 