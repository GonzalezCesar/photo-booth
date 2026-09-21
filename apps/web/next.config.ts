import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.1.103", "*.trycloudflare.com"],
  reactCompiler: true,
  transpilePackages: ["@photobooth/core"],
};

export default nextConfig;
