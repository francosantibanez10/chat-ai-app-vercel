import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para despliegue dinámico
  output: "standalone", // Optimizado para contenedores y despliegue

  // Configuración de imágenes
  images: {
    domains: [
      "localhost",
      "rubiplus-651a7.web.app",
      "vercel.app",
      "images.unsplash.com",
      "firebasestorage.googleapis.com",
    ],
    unoptimized: false, // Habilitar optimización de imágenes
  },

  // Configuración de compilación
  eslint: {
    ignoreDuringBuilds: true, // Ignorar ESLint durante build para velocidad
  },

  typescript: {
    ignoreBuildErrors: true, // Ignorar errores de TypeScript durante build
  },

  // Configuración de headers para seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
