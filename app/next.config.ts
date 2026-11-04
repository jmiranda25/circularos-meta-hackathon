import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  distDir: ".railway-next",
  async rewrites() {
    return [
      { source: "/community-demo", destination: "/community-demo.html" },
      { source: "/demo", destination: "/community-demo.html" },
    ];
  },
};
export default nextConfig;
