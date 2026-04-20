/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用生产环境优化
  productionBrowserSourceMaps: false,

  // 优化编译
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 优化图片
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // 实验性功能
  experimental: {
    optimizePackageImports: [
      '@/components/ui',
      '@/components/layouts',
      '@/components/reports',
      '@/components/notifications',
    ],
  },
};

module.exports = nextConfig;
