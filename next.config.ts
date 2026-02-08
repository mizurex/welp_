import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/overview",
        destination: "/dashboard/analytics",
        permanent: true, 
      },
      {
        source: "/dashboard",
        destination: "/dashboard/analytics",
        permanent: false, 
      },
    ];
  },
};

export default nextConfig;
