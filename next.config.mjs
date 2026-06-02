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


const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,
});

const nextConfig = {
  // 🌟 修改点 1：去掉之前的 isWindows 判断。
  // 在最新的 Next.js 环境以及 Cloudflare 全栈（opennextjs-cloudflare）环境下，
  // 保持默认的动态服务器输出，不显式指定 standalone。
  output: undefined, 

  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // 🌟 核心保留：这里对于你的 WebGL / 几何引擎非常关键！
    // 确保在浏览器端打包时，不解析 Node.js 的文件系统 'fs' 模块，防止打包报错
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },
  images: {
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
