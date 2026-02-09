import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "95.111.236.101",
        port: "7854",
        pathname: "/ozzy/**",
      },
    ],
  },
};

export default nextConfig;
