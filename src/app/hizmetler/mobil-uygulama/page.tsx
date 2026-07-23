import { ServiceDetail } from "@/components/ServiceDetail";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Mobil Uygulama", "Keşif, UX/UI, prototip, MVP ve geliştirme kapsamıyla mobil ürününüzü şekillendirin.", "/hizmetler/mobil-uygulama");
export default function MobilePage() { const service = getService("mobil-uygulama"); if (!service) return null; return <ServiceDetail service={service} />; }
