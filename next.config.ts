import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Optimized for Docker
  async redirects() {
    return [
      {
        source: "/dashboard/overview",
        destination: "/dashboard/analytics",
        permanent: true, // 308 redirect (SEO friendly, cached by browsers)
      },
      {
        source: "/dashboard",
        destination: "/dashboard/analytics",
        permanent: false, // 307 redirect
      },
    ];
  },
};

export default nextConfig;
