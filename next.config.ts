import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true 
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
  serverExternalPackages: ['mysql2'],
  experimental: {
    optimizeServerReact: false,
    disableOptimizedLoading: true, 
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'mysql2'];
    return config;
  },
  generateEtags: false,

};

export default nextConfig;
