import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BookTrail",
    short_name: "BookTrail",
    description:
      "Track your reading list, organize books into nested folders, log reading time, and review finished books.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfaf6",
    theme_color: "#3a2d26",
    orientation: "portrait",
    categories: ["books", "productivity", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
