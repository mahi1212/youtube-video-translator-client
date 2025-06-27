import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ignore eslint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure pages that need client-side data are not statically optimized
  staticPageGenerationTimeout: 120,
  experimental: {
    // This will make Next.js generate a client-side fallback for pages that can't be generated statically
    ppr: true,
  }
};

export default nextConfig;
