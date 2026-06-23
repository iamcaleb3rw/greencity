import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ucarecdn.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
  // Allow Leaflet to be bundled properly
  transpilePackages: [],
};

export default nextConfig;
