import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/content/site";
import { getSiteUrl, JsonLd } from "@/lib/seo";
import "./globals.css";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

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
    <html lang="tr" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <a className="skipLink" href="#main-content">Ana içeriğe geç</a>
        <JsonLd data={businessSchema} />
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
