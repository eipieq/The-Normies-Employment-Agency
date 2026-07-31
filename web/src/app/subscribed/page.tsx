export default function SubscribedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">payment received</h1>
      <p className="text-neutral-500 max-w-sm text-sm leading-relaxed">
        your holder pass is activating. this usually takes a few minutes while the payment confirms.
        return to any token page and refresh to unlock your access.
      </p>
      <a
        href="/"
        className="mt-2 text-sm text-primary hover:underline"
      >
        back to home
      </a>
    </main>
  );
}
