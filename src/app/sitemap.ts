import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { routes } from "@/content/site";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const staticRoutes = routes.map((route) => ({ url: new URL(route, baseUrl).toString(), changeFrequency: route === "/" ? "weekly" as const : "monthly" as const, priority: route === "/" ? 1 : .7 }));
  const projectRoutes = projects.map((project) => ({ url: new URL(`/projeler/${project.slug}`, baseUrl).toString(), changeFrequency: "monthly" as const, priority: project.featured ? .8 : .5 }));
  return [...staticRoutes, ...projectRoutes];
}
