import { FinalCta } from "@/components/FinalCta";
import { PageHero } from "@/components/PageHero";
import { ProjectGrid } from "@/components/ProjectGrid";
import { projects } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Projeler", "Vela Windsurfing ve cemwebstudio proje arşivini inceleyin.", "/projeler");
export default function ProjectsPage() { return <><PageHero eyebrow="PROJELER" title="Yayına çıkan ürünler ve büyüyen bir arşiv." description="Doğrulanmış içerik ve varlıkları bulunan projeler önce gelir; eksik vaka ayrıntıları uydurulmaz." /><section className="section"><div className="container"><ProjectGrid items={projects} editorial /></div></section><FinalCta /></>; }
