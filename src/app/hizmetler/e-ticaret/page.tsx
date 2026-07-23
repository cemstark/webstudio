import { ServiceDetail } from "@/components/ServiceDetail";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("E-ticaret", "Ürün keşfi, sepet ve checkout performansını koruyan e-ticaret deneyimleri.", "/hizmetler/e-ticaret");
export default function CommercePage() { const service = getService("e-ticaret"); if (!service) return null; return <ServiceDetail service={service} />; }
