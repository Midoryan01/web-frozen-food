import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com', 
        port: '',
        pathname: '/v1/create-qr-code/**', 
      }
    ],
  },
  
  
};

export default nextConfig;
