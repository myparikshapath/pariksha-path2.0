import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://myparikshapath.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/login",
          "/register",
          "/verify-otp",
          "/reset-password",
          "/forgot-password",
          "/student",
          "/student/*",
          "/mock/history",
          "/mock/history/*",
          "/mock/*/attempt",
        ],
      },
    ],
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: siteUrl,
  };
}