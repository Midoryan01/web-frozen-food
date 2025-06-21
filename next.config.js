/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '', 
      },
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

