import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // ✅ This skips linting entirely during Vercel builds
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
