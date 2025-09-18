import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   ppr: 'incremental'
  // }
  
  // 完全禁用开发模式指示器
  devIndicators: false,
  
  // 禁用开发模式下的错误覆盖层
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 自定义webpack配置来进一步禁用错误提示
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 禁用热重载错误覆盖层
      config.resolve.alias = {
        ...config.resolve.alias,
        '@next/react-dev-overlay': false,
      };
    }
    return config;
  },
};

export default nextConfig;
