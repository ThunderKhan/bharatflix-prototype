import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [
    { protocol: "https", hostname: "thumb.wikimedia.org" },
    { protocol: "https", hostname: "i.ytimg.com" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ] },
};

export default nextConfig;
