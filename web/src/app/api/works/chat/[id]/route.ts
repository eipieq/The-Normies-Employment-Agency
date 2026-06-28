import { POST as collectionPost } from "@/app/api/collections/[collection]/works/chat/[id]/route";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  return collectionPost(req, { params: Promise.resolve({ collection: "normies", id }) });
}
