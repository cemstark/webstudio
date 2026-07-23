import { FinalCta } from "@/components/FinalCta";
import { PageHero } from "@/components/PageHero";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SectionHeading } from "@/components/SectionHeading";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Çalışma Süreci", "Keşiften yayına kadar cemwebstudio çalışma sürecini inceleyin.", "/surec");
export default function ProcessPage() { return <><PageHero eyebrow="ÇALIŞMA SÜRECİ" title="Belirsizliği azaltan, ilerlemeyi görünür kılan süreç." description="Her adımın amacı, bir sonraki kararı daha net ve daha az riskli hale getirmektir." cta={{ label: "Brief Paylaş", href: "/iletisim" }} /><section className="section"><div className="container"><SectionHeading eyebrow="DÖRT ADIM" title="Keşiften yayına kadar aynı sorumlu." /><ProcessSteps /></div></section><section className="section sectionSurface"><div className="container split"><p className="largeStatement">Önce doğru soruyu bulur, sonra doğru ürünü üretiriz.</p><div className="stack"><p>Keşifte hedef, kullanıcı ve kısıtlar netleşir. Tasarım yönü içerik ve iş öncelikleri üzerine kurulur.</p><p>Üretimde tasarım ve geliştirme birbirinden kopmaz. Yayın öncesinde erişilebilirlik, responsive davranış, temel SEO ve performans kontrolleri yapılır.</p><p>Teslim süresi, revizyon ve ödeme planı proje kapsamı görülmeden varsayılmaz; teklifte açıkça belirlenir.</p></div></div></section><FinalCta /></>; }
