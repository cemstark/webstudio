import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import sharp from "sharp";

/**
 * Publishes project cover imagery from the local asset workspace into `public/`.
 *
 * Responsive delivery is handled by `next/image`, which derives its own srcset from
 * these sources, so this script only produces the single optimised cover per project.
 *
 * The ERP dashboard capture is deliberately absent: its source frame carries customer
 * names, dates and amounts, and no automated pass can guarantee their removal.
 * See the publication-safety note in the workspace ASSET-MANIFEST.md.
 */
const sourceDirectory = process.env.PROJECT_IMAGE_SOURCE
  ?? "C:/Users/NAZLICAN/Desktop/webstudio proje görselleri/webp-ready";
const publicDirectory = join(process.cwd(), "public", "images", "projects");
const maxWidth = Number(process.env.PROJECT_IMAGE_MAX_WIDTH ?? 2560);
const quality = Number(process.env.PROJECT_IMAGE_QUALITY ?? 82);

const publishedProjects = [
  { slug: "vela-windsurfing", source: "vela-windsurfing-web-design.webp" },
  { slug: "aysaworks", source: "aysaworks-interior-architecture-projects.webp" },
  { slug: "bluekim", source: "bluekim-bluemet-corporate-website.webp" },
  { slug: "drnekinoto-servis", source: "drnekinoto-automotive-service-website.webp" },
  { slug: "cemwebstudio", source: "cemwebstudio-portfolio-homepage.webp" },
];

const withheldSources = ["erp-business-management-dashboard.webp"];

async function publish({ slug, source }) {
  const sourcePath = join(sourceDirectory, source);
  if (!existsSync(sourcePath)) return { slug, status: "source-missing", sourcePath };

  const targetDirectory = join(publicDirectory, slug);
  const targetPath = join(targetDirectory, `${slug}-cover.webp`);
  await mkdir(targetDirectory, { recursive: true });

  const input = await readFile(sourcePath);
  const { width: sourceWidth, height: sourceHeight } = await sharp(input).metadata();

  // Re-encoding an already-optimised WebP only loses quality, so pass it through untouched
  // unless the source is wider than the largest size the layout can request.
  const needsResize = sourceWidth > maxWidth;
  const output = needsResize
    ? await sharp(input).resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality, effort: 6 }).toBuffer()
    : input;

  const previous = existsSync(targetPath) ? await readFile(targetPath) : null;
  if (previous?.equals(output)) {
    return { slug, status: "unchanged", width: sourceWidth, height: sourceHeight, bytes: output.length };
  }

  await writeFile(targetPath, output);
  const { width, height } = await sharp(output).metadata();
  return { slug, status: previous ? "updated" : "created", width, height, bytes: output.length };
}

const results = [];
for (const project of publishedProjects) {
  results.push(await publish(project));
}

console.table(results.map(({ slug, status, width, height, bytes }) => ({
  slug,
  status,
  dimensions: width && height ? `${width}x${height}` : "—",
  kb: bytes ? Number((bytes / 1024).toFixed(1)) : "—",
})));

for (const withheld of withheldSources) {
  const leaked = join(process.cwd(), "public", basename(withheld));
  if (existsSync(leaked)) throw new Error(`Withheld source published at ${leaked}. Remove it before shipping.`);
  console.info(`withheld (personal data): ${withheld}`);
}
