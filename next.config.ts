import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // Supabase Storage (existing images — kept during migration)
      {
        protocol: 'https',
        hostname: 'nlxldwoowqoafykhcxre.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Cloudflare R2 via custom domain (new images — zero egress)
      {
        protocol: 'https',
        hostname: 'cdn.giaromart.com',
      },
      // R2.dev fallback (in case custom domain isn't set up yet)
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
};

export default nextConfig;
