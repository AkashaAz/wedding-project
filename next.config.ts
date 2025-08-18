import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Konva.js SSR issues
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];
    }

    return config;
  },
  transpilePackages: ["konva", "react-konva"],
};

export default nextConfig;
