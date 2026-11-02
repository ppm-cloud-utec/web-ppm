import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No generar AGENTS.md/CLAUDE.md en el repo del equipo
  agentRules: false,
};

export default nextConfig;
