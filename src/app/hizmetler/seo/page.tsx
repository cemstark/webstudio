import { ServiceDetail } from "@/components/ServiceDetail";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("SEO", "Teknik SEO, audit, içerik ve anahtar kelime çalışmalarını ihtiyacınıza göre kapsamlayın.", "/hizmetler/seo");
export default function SeoPage() { const service = getService("seo"); if (!service) return null; return <ServiceDetail service={service} />; }
