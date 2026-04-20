import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PatiTas · Mascotas perdidas",
    short_name: "PatiTas",
    description: "Encuentra mascotas perdidas en Tecámac y zona metropolitana.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF7ED",
    theme_color: "#F97316",
    orientation: "portrait",
    lang: "es-MX",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
