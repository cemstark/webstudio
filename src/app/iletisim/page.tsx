import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("İletişim", "Projenizin hedefini, kapsamını ve bütçe çerçevesini cemwebstudio ile paylaşın.", "/iletisim");
export default function ContactPage() { return <><PageHero eyebrow="PROJE BAŞLAT" title="İlk adım, iyi bir brief." description="Hedefinizi ve aklınızdaki kapsamı paylaşın. Eksik noktaları birlikte netleştirip yalnızca ihtiyacınıza göre teklif hazırlayalım." /><section className="section"><div className="container split"><div><p className="eyebrow">BRIEF FORMU</p><h2>Projenizi anlatın.</h2><p className="lead" style={{ marginTop: "1.5rem" }}>Form sunucuda doğrulanır. Bilgileriniz yalnızca talebinize yanıt vermek için kullanılır.</p></div><Suspense fallback={<p>Form hazırlanıyor…</p>}><ContactForm /></Suspense></div></section></>; }
