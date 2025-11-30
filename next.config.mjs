/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ actually works now
  },

  images: {
    domains: [
      "localhost",
      "via.placeholder.com",
      "picsum.photos",
      "images.unsplash.com",
      "cdn.example.com",

      // DigitalOcean Spaces
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
