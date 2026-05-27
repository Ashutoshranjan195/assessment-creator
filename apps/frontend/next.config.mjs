import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vedaai/shared'],
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = Object.assign({}, config.resolve.alias, {
      '@': path.resolve(__dirname, 'src'),
    });
    return config;
  },
  experimental: {
    typedRoutes: false,
  },
  async rewrites() {
    // Proxy API calls to the backend using BACKEND_INTERNAL_URL
    // This allows the worker (running Puppeteer) to fetch assignment data via /api/
    const backend = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/healthz', destination: `${backend}/healthz` },
    ];
  },
};
export default nextConfig;
