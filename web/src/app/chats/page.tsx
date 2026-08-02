import type { Metadata } from "next";
import { ChatsContent } from "@/components/chats-content";

export const metadata: Metadata = {
  title: "Your Chats — the normies employment agency",
  description: "Every conversation you've had with your coworkers.",
};

export default function ChatsPage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-12 pb-24">
      <div className="max-w-2xl mx-auto w-full">
        <ChatsContent />
      </div>
    </main>
  );
}
