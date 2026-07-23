export type ProjectStatus = "live" | "archive";
export type Project = { slug: string; name: string; year?: number; status: ProjectStatus; statusLabel: string; category: string; description: string; featured: boolean; url?: string; image?: { src: string; alt: string; width: number; height: number }; missingAssets?: boolean };

export const projects: readonly Project[] = [
  { slug: "vela-windsurfing", name: "Vela Windsurfing", year: 2026, status: "live", statusLabel: "Yayında", category: "Web Tasarım & Geliştirme", description: "Vela Windsurfing için tasarlanıp yayına alınan web sitesi.", featured: true, url: "https://velawindsurfing.com", image: { src: "/images/projects/vela-windsurfing/vela-windsurfing.webp", alt: "Vela Windsurfing web sitesinin yayın görseli", width: 1200, height: 630 } },
  { slug: "aysaworks", name: "AysaWorks", status: "archive", statusLabel: "Arşiv", category: "Web Tasarım", description: "Proje içeriği ve görselleri eklenecek.", featured: true, missingAssets: true },
  { slug: "bluekim", name: "BlueKim", status: "archive", statusLabel: "Arşiv", category: "Web Tasarım", description: "Proje içeriği ve görselleri eklenecek.", featured: true, missingAssets: true },
  { slug: "drnekinoto-servis", name: "DRNEKİNOTO SERVİS", status: "archive", statusLabel: "Arşiv", category: "Web Geliştirme", description: "Proje içeriği ve görselleri eklenecek.", featured: false, missingAssets: true },
  { slug: "cemwebstudio", name: "cemwebstudio", year: 2026, status: "live", statusLabel: "Yayında", category: "Marka & Web", description: "Solo stüdyo için tasarlanan çok sayfalı web deneyimi.", featured: false, missingAssets: true },
  { slug: "atlas-panel-script", name: "ATLAS PANEL SCRIPT", status: "archive", statusLabel: "Arşiv", category: "Ürün Arayüzü", description: "Proje içeriği ve görselleri eklenecek.", featured: false, missingAssets: true },
  { slug: "drn-servis-paneli", name: "DRN Servis Paneli", status: "archive", statusLabel: "Arşiv", category: "Ürün Arayüzü", description: "Proje içeriği ve görselleri eklenecek.", featured: false, missingAssets: true },
] as const;

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
export const featuredProjects = projects.filter((project) => project.featured);
