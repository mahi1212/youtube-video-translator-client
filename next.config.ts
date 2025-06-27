import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ignore eslint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure pages that need client-side data are not statically optimized
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
