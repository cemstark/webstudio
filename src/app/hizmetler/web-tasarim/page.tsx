import { ServiceDetail } from "@/components/ServiceDetail";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Web Tasarım ve Blog", "Hızlı, erişilebilir ve markanıza özel web sitesi ve blog çözümleri.", "/hizmetler/web-tasarim");
export default function WebDesignPage() { const service = getService("web-tasarim"); if (!service) return null; return <ServiceDetail service={service} />; }
