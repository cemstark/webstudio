import Link from "next/link";
import { FinalCta } from "@/components/FinalCta";
import { PageHero } from "@/components/PageHero";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Hizmetler", "Web tasarım, SEO, mobil uygulama ve e-ticaret hizmetlerini keşfedin.", "/hizmetler");

export default function ServicesPage() {
  return (
    <><PageHero eyebrow="HİZMETLER" title="Dijital varlığınızın ihtiyaç duyduğu dört odak alanı." description="Her hizmet; hedefi, kapsamı ve ortaya çıkacak işi anlaşılır tutan doğrudan bir çalışma modeliyle ilerler." cta={{ label: "Projenizi Anlatın", href: "/iletisim" }} />
    <section className="section"><div className="container cardGrid">{services.map((service, index) => <article className="serviceCard" key={service.slug}><div><p className="micro">0{index + 1} · {service.eyebrow}</p><h2>{service.shortTitle}</h2></div><div><p>{service.summary}</p><p className="priceSignal">{service.priceSignal}</p><Link className="textLink" href={`/hizmetler/${service.slug}`}>Kapsamı Gör <span aria-hidden="true">↗</span></Link></div></article>)}</div></section><FinalCta /></>
  );
}
