export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-8">
      <div className="max-w-xs text-center space-y-2">
        <p className="text-sm uppercase tracking-widest text-neutral-400">
          normies employment agency
        </p>
        <h1 className="text-xl font-medium text-neutral-900">
          normie not found
        </h1>
        <p className="text-sm text-neutral-500">
          this token doesn&apos;t exist or hasn&apos;t been minted yet.
        </p>
      </div>
    </main>
  );
}
