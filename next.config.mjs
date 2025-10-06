/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allowed origins (no effect in prod unless custom middleware)
  allowedDevOrigins: [
    'frontend-uptimex-hkajb7g9e8abgpg2.centralus-01.azurewebsites.net',
    '*.azurewebsites.net'
  ],
  reactStrictMode: false,
  output: 'standalone',
  // Ensure each deploy has a fresh BUILD_ID to invalidate Azure caches
  generateBuildId: async () => `${Date.now()}`,
}

export default nextConfig;
