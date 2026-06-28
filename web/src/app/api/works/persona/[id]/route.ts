import { GET as collectionGet } from "@/app/api/collections/[collection]/works/persona/[id]/route";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  return collectionGet(req, { params: Promise.resolve({ collection: "normies", id }) });
}
