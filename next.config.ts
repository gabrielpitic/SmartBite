import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the Dockerfile standalone build
  output: "standalone",

  // Allow images from external sources if you add dish photos later
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;