import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/coach",
          "/coach/*",
          "/api",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/become-coach/success",
        ],
      },
    ],
    sitemap: "https://selffits.com/sitemap.xml",
    host: "https://selffits.com",
  };
}
