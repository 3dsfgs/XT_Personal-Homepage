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
  output: isWindows ? undefined : "standalone",
  //output: "export", // 核心修改：改为静态导出
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
