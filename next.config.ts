import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["playwright"],
  allowedDevOrigins: [
    "localhost",
    "localhost:3000",
    "0.0.0.0",
    "0.0.0.0:3000",
    "192.168.100.6",
    "192.168.100.6:3000",
    "192.168.*",
    "10.*",
    "172.16.*",
  ],
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};

export default nextConfig;
