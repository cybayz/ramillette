import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.ramillette.com",
      },
      {
        protocol: "https",
        hostname: "videomedia.vizupcommerce.com",
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
