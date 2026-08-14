import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "break-point",
    short_name: "break-point",
    description: "Your tennis diary with an AI coach",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe4",
    theme_color: "#b8622f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "800x1308",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
