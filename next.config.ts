import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hosts desde los que se sirven las imágenes de producto (MinIO).
    // `next/image` rechaza en tiempo de render cualquier host no listado, así
    // que si el almacenamiento cambia de dirección hay que añadirla aquí.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "161.97.185.246",
        port: "9000",
        pathname: "/ozzy/**",
      },
      {
        // Host anterior: se conserva porque las urls se guardan absolutas en
        // BD y las imágenes subidas antes del cambio siguen apuntando aquí.
        protocol: "http",
        hostname: "95.111.236.101",
        port: "7854",
        pathname: "/ozzy/**",
      },
      {
        // MinIO local, para desarrollo.
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/ozzy/**",
      },
    ],
  },
};

export default nextConfig;
