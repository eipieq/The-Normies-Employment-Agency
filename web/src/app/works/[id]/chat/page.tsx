import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyChatRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/collections/normies/works/${id}/chat`);
}
