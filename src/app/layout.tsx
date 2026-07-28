import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MotionObserver } from "@/components/motion/MotionObserver";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { site } from "@/content/site";
import { getSiteUrl, JsonLd } from "@/lib/seo";
import "./globals.css";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: "cemwebstudio — Dijital ürün stüdyosu", template: "%s — cemwebstudio" },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.owner }],
  creator: site.owner,
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", locale: site.locale, siteName: site.name, title: "cemwebstudio — Dijital ürün stüdyosu", description: site.description },
  twitter: { card: "summary_large_image", title: "cemwebstudio — Dijital ürün stüdyosu", description: site.description },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff", colorScheme: "light" };

const businessSchema = {
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "LocalBusiness"],
  name: site.name,
  founder: { "@type": "Person", name: site.owner },
  description: site.description,
  url: getSiteUrl().toString(),
  address: { "@type": "PostalAddress", addressLocality: "İzmit", addressRegion: "Kocaeli", addressCountry: "TR" },
  areaServed: { "@type": "Country", name: "Türkiye" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={geist.variable}>
      <body>
        <a className="skipLink" href="#main-content">Ana içeriğe geç</a>
        <JsonLd data={businessSchema} />
        <MotionObserver />
        <SmoothScroll />
        <RouteTransition />
        <SiteHeader />
        <main id="main-content" tabIndex={-1}><ScrollMotion />{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
