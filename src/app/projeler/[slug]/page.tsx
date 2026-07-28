import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/FinalCta";
import { PageHero } from "@/components/PageHero";
import { getProject, projects } from "@/content/projects";
import { breadcrumbSchema, getSiteUrl, JsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

type ProjectPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata(project.name, project.description, `/projeler/${project.slug}`, project.image?.src);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const projectPath = `/projeler/${project.slug}`;
  const breadcrumb = breadcrumbSchema([
    { name: "Ana Sayfa", path: "/" },
    { name: "Projeler", path: "/projeler" },
    { name: project.name, path: projectPath },
  ]);
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.description,
    genre: project.category,
    url: new URL(projectPath, getSiteUrl()).toString(),
    dateCreated: project.year?.toString(),
    image: project.image ? new URL(project.image.src, getSiteUrl()).toString() : undefined,
    sameAs: project.url,
    creator: { "@type": "ProfessionalService", name: "cemwebstudio" },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={projectSchema} />
      <PageHero eyebrow={`${project.year ?? "ARŞİV"} · ${project.statusLabel}`} title={project.name} description={project.description} />
      <section className="section">
        <div className="container">
          {project.image ? (
            <Image className="projectDetailImage" src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} sizes="(min-width: 1344px) 1216px, calc(100vw - 2.5rem)" />
          ) : (
            <div className="projectVisual projectDetailPlaceholder"><span className="projectPlaceholder"><span>{project.name}</span><small>Arşiv / içerik hazırlanıyor</small></span></div>
          )}
        </div>
      </section>
      <section className="section sectionSurface">
        <div className="container split">
          <div><p className="eyebrow">PROJE ÖZETİ</p><h2>Doğrulanmış bilgiler.</h2></div>
          <div className="stack">
            <p className="lead">{project.description}</p>
            <p><strong>Verilen hizmet:</strong> {project.category}</p>
            <p><strong>Durum:</strong> {project.statusLabel}</p>
            {project.url ? <a className="button" href={project.url} target="_blank" rel="noopener noreferrer">Canlı Siteyi Gör <span aria-hidden="true">↗</span></a> : null}
            {project.missingAssets ? <p className="providerNote">Bu proje için gerçek vaka metni ve görseller henüz sağlanmadı. Sonuç, metrik veya teknoloji bilgisi eklenmedi.</p> : null}
            <Link className="textLink" href="/projeler">Tüm Projelere Dön <span aria-hidden="true">←</span></Link>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
