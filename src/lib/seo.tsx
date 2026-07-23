import type { Metadata } from "next";
import { site } from "@/content/site";

export const getSiteUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.defaultUrl;
  try { return new URL(rawUrl); } catch { return new URL(site.defaultUrl); }
};

export const pageMetadata = (title: string, description: string, path: string): Metadata => ({
  title, description, alternates: { canonical: path },
  openGraph: { title, description, url: path, type: "website", locale: site.locale, siteName: site.name },
  twitter: { card: "summary_large_image", title, description },
});

export const breadcrumbSchema = (items: readonly { name: string; path: string }[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: new URL(item.path, getSiteUrl()).toString() })),
});

export const JsonLd = ({ data }: { data: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
);
