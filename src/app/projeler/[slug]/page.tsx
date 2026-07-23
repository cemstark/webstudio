import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/FinalCta";
import { PageHero } from "@/components/PageHero";
import { getProject, projects } from "@/content/projects";
import { breadcrumbSchema, JsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })); }

type ProjectPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params; const project = getProject(slug);
  if (!project) return {};
  return pageMetadata(project.name, project.description, `/projeler/${project.slug}`);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params; const project = getProject(slug); if (!project) notFound();
  const breadcrumb = breadcrumbSchema([{ name: "Ana Sayfa", path: "/" }, { name: "Projeler", path: "/projeler" }, { name: project.name, path: `/projeler/${project.slug}` }]);
  return <><JsonLd data={breadcrumb} /><PageHero eyebrow={`${project.year ?? "ARŞİV"} · ${project.statusLabel}`} title={project.name} description={project.description} />
  <section className="section"><div className="container">{project.image ? <Image src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} priority sizes="100vw" style={{ width: "100%", height: "auto" }} /> : <div className="projectVisual"><span className="projectPlaceholder"><span>{project.name}</span><small>Gerçek proje görseli bekleniyor</small></span></div>}</div></section>
  <section className="section sectionSurface"><div className="container split"><div><p className="eyebrow">PROJE ÖZETİ</p><h2>Doğrulanmış bilgiler.</h2></div><div className="stack"><p className="lead">{project.description}</p><p><strong>Verilen hizmet:</strong> {project.category}</p><p><strong>Durum:</strong> {project.statusLabel}</p>{project.url && <a className="button" href={project.url} target="_blank" rel="noopener noreferrer">Canlı Siteyi Gör <span aria-hidden="true">↗</span></a>}{project.missingAssets && <p className="providerNote">Bu proje için gerçek vaka metni ve görseller henüz sağlanmadı. Sonuç veya teknoloji bilgisi eklenmedi.</p>}<Link className="textLink" href="/projeler">Tüm Projelere Dön <span aria-hidden="true">←</span></Link></div></div></section><FinalCta /></>;
}
