export type ProjectStatus = "live" | "archive";
export type Project = {
  slug: string;
  name: string;
  year?: number;
  status: ProjectStatus;
  statusLabel: string;
  category: string;
  description: string;
  featured: boolean;
  url?: string;
  image?: { src: string; alt: string; width: number; height: number; position?: string };
  missingAssets?: boolean;
};

export const projects: readonly Project[] = [
  { slug: "vela-windsurfing", name: "Vela Windsurfing", year: 2026, status: "live", statusLabel: "Yayında", category: "Web Tasarım & Geliştirme", description: "Vela Windsurfing için tasarlanıp yayına alınan web sitesi.", featured: true, url: "https://velawindsurfing.com", image: { src: "/images/projects/vela-windsurfing/vela-windsurfing-cover.webp", alt: "Vela Windsurfing sörf okulu web sitesinin tam ekran görselli ana sayfası", width: 2503, height: 1408, position: "48% center" } },
  { slug: "aysaworks", name: "AysaWorks", status: "archive", statusLabel: "Arşiv", category: "Web Tasarım", description: "İç mimarlık projelerini sergileyen web sitesi ve portfolyo deneyimi.", featured: true, image: { src: "/images/projects/aysaworks/aysaworks-cover.webp", alt: "AysaWorks iç mimarlık web sitesinin proje portfolyosunu listeleyen sayfası", width: 2498, height: 1395, position: "50% center" } },
  { slug: "bluekim", name: "BlueKim", status: "archive", statusLabel: "Arşiv", category: "Web Tasarım", description: "BlueKim ve BlueMet markalarını aynı kurumsal deneyimde buluşturan web sitesi.", featured: true, image: { src: "/images/projects/bluekim/bluekim-cover.webp", alt: "BlueKim ve BlueMet kimya ve metal markalarını birleştiren kurumsal web sitesi ana sayfası", width: 2495, height: 1371, position: "50% center" } },
  { slug: "drnekinoto-servis", name: "DRNEKİN OTO", status: "archive", statusLabel: "Arşiv", category: "Web Geliştirme", description: "İzmit ve Kocaeli odaklı otomotiv servis web sitesi.", featured: true, image: { src: "/images/projects/drnekinoto-servis/drnekinoto-servis-cover.webp", alt: "DRNEKİN OTO otomotiv servis web sitesinin hizmet bölümlerini gösteren ana sayfası", width: 2496, height: 1396, position: "52% center" } },
  { slug: "cemwebstudio", name: "cemwebstudio", year: 2026, status: "live", statusLabel: "Yayında", category: "Marka & Web", description: "Web tasarım, SEO, mobil uygulama ve e-ticaret hizmetlerini sunan stüdyo portfolyosu.", featured: true, image: { src: "/images/projects/cemwebstudio/cemwebstudio-cover.webp", alt: "cemwebstudio stüdyo portfolyosunun 3B robot sahneli ana sayfası", width: 2460, height: 1402, position: "50% center" } },
  { slug: "erp-is-yonetim-paneli", name: "ERP İş Yönetim Paneli", status: "archive", statusLabel: "Arşiv", category: "Web Uygulama", description: "İş süreçlerini ve genel durum kartlarını tek gösterge panelinde bir araya getiren web uygulaması arayüzü.", featured: false, image: { src: "/images/projects/erp-is-yonetim-paneli/erp-is-yonetim-paneli-cover.webp", alt: "Anonimleştirilmiş ERP iş yönetimi gösterge paneli", width: 2498, height: 1418, position: "50% top" } },
  { slug: "atlas-panel-script", name: "ATLAS PANEL SCRIPT", status: "archive", statusLabel: "Arşiv", category: "Ürün Arayüzü", description: "Proje içeriği ve görselleri eklenecek.", featured: false, missingAssets: true },
  { slug: "drn-servis-paneli", name: "DRN Servis Paneli", status: "archive", statusLabel: "Arşiv", category: "Ürün Arayüzü", description: "Proje içeriği ve görselleri eklenecek.", featured: false, missingAssets: true },
] as const;

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
export const featuredProjects = projects.filter((project) => project.featured);
