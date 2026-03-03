import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Enzi - Comidas de Enzo",
    short_name: "Enzi",
    description: "Registra las comidas de Enzo con NFC",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFBEB",
    theme_color: "#F59E0B",
    orientation: "portrait",
    categories: ["lifestyle", "utilities"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
