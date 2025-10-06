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
  // Force browsers/Azure to revalidate Next static and data assets
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/_next/data/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig;
