import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ['placehold.co'], // add any external hostnames here
  },
};

export default nextConfig;
