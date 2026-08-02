import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-8">
      <div className="max-w-xs text-center space-y-4">
        <p className="font-mono text-sm text-neutral-400">404</p>
        <h1 className="font-pixel-square text-xl text-neutral-900">not on file</h1>
        <p className="text-sm text-neutral-500">
          this token doesn&apos;t exist or hasn&apos;t been minted yet.
        </p>
        <Link
          href="/explore"
          className="inline-block text-sm font-medium text-neutral-900 underline underline-offset-4"
        >
          explore the agency
        </Link>
      </div>
    </main>
  );
}
