/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-api-domain.com', 'firebasestorage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  output: 'standalone',
  // Configurações para produção na Vercel
  poweredByHeader: false, // Remove o header X-Powered-By por segurança
  compress: true, // Habilita compressão gzip
  reactStrictMode: true,
  swcMinify: true, // Usa SWC para minificação (mais rápido)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  typescript: {
    ignoreBuildErrors: false, // Em produção, deveria ser false
  },
  eslint: {
    ignoreDuringBuilds: false, // Em produção, deveria ser false
  },
  // Configurações de headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
