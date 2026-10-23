import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [
    { protocol: "https", hostname: "thumb.wikimedia.org" },
    { protocol: "https", hostname: "i.ytimg.com" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ] },
  // better-sqlite3 is a native module: keep it out of the server bundle.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
