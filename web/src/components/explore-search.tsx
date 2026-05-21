"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ExploreSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    const raw = query.trim().replace(/^#/, "");
    const id = parseInt(raw, 10);

    if (!raw || Number.isNaN(id) || id < 0 || id > 9999) {
      setError("Enter a token ID between 0 and 9999.");
      return;
    }

    setError("");
    router.push(`/works/${id}`);
  }

  return (
    <form onSubmit={search} className="w-full max-w-md space-y-2">
      <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white p-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <input
          type="text"
          inputMode="numeric"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError("");
          }}
          placeholder="Search by token ID"
          className="flex-1 bg-transparent px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
        >
          Search
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
