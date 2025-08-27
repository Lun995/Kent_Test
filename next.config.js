const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

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
    unoptimized: true, // 改為 true 以支援靜態導出
  },
  // 輸出設定 - 確保 SPA 路由正常工作
  trailingSlash: false,
  // 移除衝突的配置
  // output: 'export', // 移除這個，因為會與 API 路由衝突
  // experimental: { appDir: true }, // 移除過時的配置
};

module.exports = withPWA(nextConfig); 