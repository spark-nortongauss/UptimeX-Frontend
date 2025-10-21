/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel runs Next.js natively; no custom server or standalone output needed
  reactStrictMode: true,
  
  // Ensure proper handling of Leaflet assets in production
  webpack: (config) => {
    // Fix for Leaflet markers in production builds
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    return config
  },
  
  // Optimize for production builds
  experimental: {
    optimizePackageImports: ['leaflet', 'react-leaflet']
  }
}

export default nextConfig;
