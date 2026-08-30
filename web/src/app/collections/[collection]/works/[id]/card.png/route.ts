import { getCollection, parseTokenId, NormiesApiError } from "@/lib/collections";
import { loadWorks } from "@/lib/load-works";
import { cardFilename, renderEmploymentCard } from "@/lib/card-export";

export const runtime = "nodejs";
export const revalidate = 3600;

type Params = { params: Promise<{ collection: string; id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null) return new Response("not found", { status: 404 });

  let data: Awaited<ReturnType<typeof loadWorks>>;
  try {
    data = await loadWorks(adapter.meta.slug, tokenId);
  } catch (e) {
    if (e instanceof NormiesApiError && e.status >= 400 && e.status < 500) {
      return new Response("not found", { status: 404 });
    }
    throw e;
  }

  const { persona } = data;
  const idLabel = `${adapter.meta.label} #${String(tokenId).padStart(4, "0")}`;

  const image = await renderEmploymentCard({
    portrait: data.dossier.portrait,
    jobTitle: persona.jobTitle,
    oneLiner: persona.oneLiner,
    idLabel,
  });

  image.headers.set("Content-Type", "image/png");
  image.headers.set("Content-Disposition", `attachment; filename="${cardFilename(adapter.meta.label, tokenId)}"`);
  image.headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  );

  return image;
}
