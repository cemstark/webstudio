import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";

export function ProjectGrid({ items, editorial = false }: { items: readonly Project[]; editorial?: boolean }) {
  return (
    <div className={`projectGrid ${editorial ? "projectGridEditorial" : ""}`}>
      {items.map((project) => (
        <article className="projectCard" key={project.slug} data-stagger>
          <Link className="projectVisual" href={`/projeler/${project.slug}`} aria-label={`${project.name} projesini gör`}>
            {project.image ? (
              <Image
                src={project.image.src}
                alt={project.image.alt}
                width={project.image.width}
                height={project.image.height}
                sizes="(min-width: 1344px) 608px, (min-width: 961px) calc(50vw - 6rem), calc(100vw - 2.5rem)"
                style={{ objectPosition: project.image.position }}
              />
            ) : (
              <span className="projectPlaceholder"><span>{project.name}</span><small>Arşiv / içerik hazırlanıyor</small></span>
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
