"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center px-8">
      <div className="max-w-xs text-center space-y-4">
        <p className="font-mono text-sm text-neutral-400">error</p>
        <h1 className="font-pixel-square text-xl text-neutral-900">something went wrong</h1>
        <p className="text-sm text-neutral-500">
          the agency hit an unexpected error. try again or come back later.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            try again
          </button>
          <Link
            href="/"
            className="text-sm font-medium text-neutral-500 underline underline-offset-4"
          >
            go home
          </Link>
        </div>
      </div>
    </main>
  );
}
