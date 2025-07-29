import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Vercel (sin exportación estática)
  images: {
    domains: ["localhost", "rubiplus-651a7.web.app", "vercel.app"],
  },
  // Deshabilitar ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Deshabilitar TypeScript checking durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración para desarrollo y producción
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
