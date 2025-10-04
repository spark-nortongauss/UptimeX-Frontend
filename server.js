// Delegate to Next.js standalone production server
process.env.NODE_ENV = 'production'
require('./.next/standalone/server.js')