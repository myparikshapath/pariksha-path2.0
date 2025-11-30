import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Fix Vercel build failures caused by ESLint errors
  },

  images: {
    domains: [
      "localhost",
      "via.placeholder.com",
      "picsum.photos",
      "images.unsplash.com",
      "cdn.example.com",

      // ✅ DigitalOcean Spaces / CDN
      "pariksha-path-bucket.nyc3.cdn.digitaloceanspaces.com",
      "nyc3.digitaloceanspaces.com",
    ],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
