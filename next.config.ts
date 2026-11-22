import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,

  output: "export",

  // Con export estatico Next no optimiza imagenes en servidor.
  images: { unoptimized: true },

  trailingSlash: true,
};

export default nextConfig;
