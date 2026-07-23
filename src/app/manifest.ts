import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "cemwebstudio", short_name: "cemwebstudio", description: "Cem Yıldız'ın solo dijital stüdyosu.", start_url: "/", display: "standalone", background_color: "#FAFAF8", theme_color: "#2D62FF", lang: "tr", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] };
}
