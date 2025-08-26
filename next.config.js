/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true, // 啟用 React 嚴格模式
  typescript: {
    ignoreBuildErrors: false, // 建議保持為 false
  },
  // Vercel 部署優化
  swcMinify: true, // 使用 SWC 進行最小化
  // 圖片優化
  images: {
    domains: [],
    unoptimized: false,
  },
  // 重定向配置
  async redirects() {
    return [];
  },
  // 重寫配置
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig; 