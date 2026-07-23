import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";

export function ProjectGrid({ items, priorityFirst = false }: { items: readonly Project[]; priorityFirst?: boolean }) {
  return (
    <div className="projectGrid">
      {items.map((project, index) => (
        <article className="projectCard" key={project.slug}>
          <Link className="projectVisual" href={`/projeler/${project.slug}`} aria-label={`${project.name} projesini gör`}>
            {project.image ? (
              <Image src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} sizes="(min-width: 900px) 50vw, 100vw" priority={priorityFirst && index === 0} />
            ) : (
              <span className="projectPlaceholder"><span>{project.name}</span><small>Görsel bekleniyor</small></span>
            )}
          </Link>
          <div className="projectMeta"><span>{project.year ?? "—"} · {project.statusLabel}</span><span>{project.category}</span></div>
          <h3><Link href={`/projeler/${project.slug}`}>{project.name}</Link></h3>
          <p>{project.description}</p>
          {project.url && <a className="textLink" href={project.url} target="_blank" rel="noopener noreferrer">Canlı site <span aria-hidden="true">↗</span></a>}
        </article>
      ))}
    </div>
  );
}
