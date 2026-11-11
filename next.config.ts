import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No generar archivos de instrucciones para asistentes de IA en el repo
  agentRules: false,

  // Sitio ESTATICO. Todas las pantallas son "use client" y los datos llegan
  // de las APIs en ejecucion, asi que no hay nada que renderizar en servidor.
  // Amplify lo sirve sin computo: mas barato, mas rapido y sin region fria.
  output: "export",

  // Con export estatico Next no optimiza imagenes en servidor.
  images: { unoptimized: true },

  // Cada ruta sale como carpeta con index.html, que es lo que espera el
  // hosting estatico de Amplify para que /proyectos funcione sin barra final.
  trailingSlash: true,
};

export default nextConfig;
