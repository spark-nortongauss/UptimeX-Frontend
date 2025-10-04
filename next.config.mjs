/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'frontend-uptimex-hkajb7g9e8abgpg2.centralus-01.azurewebsites.net',
    '*.azurewebsites.net'
  ],
  // Disable strict mode for production
  reactStrictMode: false,
  // Configure for production deployment
  output: 'standalone'
};

export default nextConfig;
