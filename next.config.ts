import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent webpack from bundling server-only packages — fixes compilation lag & crashes
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  // Suppress known harmless warnings
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
