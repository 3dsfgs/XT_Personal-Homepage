/*
 * @Author: kasuie
 * @Date: 2024-05-20 16:08:41
 * @LastEditors: kasuie
 * @LastEditTime: 2025-04-17 17:48:01
 * @Description:
 */
/** @type {import('next').NextConfig} */
import nextPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";
const isWindows = process.platform === "win32";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,
});

const nextConfig = {
  // 🌟 修改这里：为了手动上传到 Cloudflare 静态托管，强行将其改为 "export"
  // 原本的逻辑是：output: isWindows ? undefined : "standalone",
  output: "export", 
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },
  images: {
    // ⚠️ 注意：Next.js 在静态导出(export)模式下，默认不支持自带的图片优化服务。
    // 如果打包时因为自带的 <Image /> 组件报错，可以在这里加上 unoptimized: true
    unoptimized: true, 
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.staticaly.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "pixiv.re",
      },
    ],
  },
};

export default withPWA(nextConfig);