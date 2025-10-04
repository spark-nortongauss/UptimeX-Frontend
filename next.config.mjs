/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allowed origins (no effect in prod unless custom middleware)
  allowedDevOrigins: [
    'frontend-uptimex-hkajb7g9e8abgpg2.centralus-01.azurewebsites.net',
    '*.azurewebsites.net'
  ],
  reactStrictMode: false,
  output: 'standalone',
}

export default nextConfig;
