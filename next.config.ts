import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [
    { protocol: "https", hostname: "thumb.wikimedia.org" },
    { protocol: "https", hostname: "i.ytimg.com" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ] },
  // SQLite studio demo seeds from these local fixtures at runtime in Vercel functions.
  outputFileTracingIncludes: {
    "/*": ["./src/data/*.json", "./src/lib/db/schema.sql"],
  },
};

export default nextConfig;
