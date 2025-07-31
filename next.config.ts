import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

   output: 'standalone', // 啟用 Standalone 模式
   reactStrictMode: true, // 啟用 React 嚴格模式
  typescript: {
    ignoreBuildErrors: false, // 建議保持為 false
  },
};

export default nextConfig;
