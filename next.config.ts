import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Event banners are uploaded to Cloudinary
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
