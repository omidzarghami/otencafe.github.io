import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "otencafe.ir",
      },
    ],
    unoptimized: false,
  },
  // Enable RTL support
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
