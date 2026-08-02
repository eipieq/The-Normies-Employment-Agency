import { getCollection, parseTokenId } from "@/lib/collections";
import { getPersona } from "@/lib/persona";

export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("not found", { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("collection");
  const idParam = searchParams.get("id");

  const adapter = slug ? getCollection(slug) : null;
  const tokenId = idParam ? parseTokenId(idParam) : null;
  if (!adapter || tokenId === null) {
    return new Response("missing or invalid collection/id", { status: 400 });
  }

  const dossier = await adapter.loadDossier(tokenId);
  const persona = await getPersona(adapter.meta.slug, tokenId, dossier);

  return Response.json({
    collection: adapter.meta.slug,
    tokenId,
    label: adapter.meta.label,
    jobTitle: persona.jobTitle,
    oneLiner: persona.oneLiner,
    systemPrompt: persona.systemPrompt,
    examples: persona.examples ?? [],
  });
}
