import type { Metadata } from "next";
import { RosterContent } from "@/components/roster-content";

export const metadata: Metadata = {
  title: "Your Roster — the normies employment agency",
  description: "View all normies held by your connected wallet.",
};

export default function RosterPage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-12 pb-24">
      <div className="max-w-4xl mx-auto w-full">
        <RosterContent />
      </div>
    </main>
  );
}
