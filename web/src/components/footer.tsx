import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-white px-4 sm:px-8 py-6 mt-auto">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="text-neutral-900"
          style={{ fontFamily: "var(--font-instrument-sans)", fontWeight: 500, fontSize: "13px", letterSpacing: "-0.01em", lineHeight: 1 }}
        >
          The<br />Employment Agency
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="https://normies.art"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-800 transition-colors"
            style={{ fontFamily: "var(--font-instrument-sans)", fontWeight: 500, letterSpacing: "-0.01em" }}
          >
            normies.art
          </Link>
          <Link
            href="https://adsq.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-800 transition-colors"
            style={{ fontFamily: "var(--font-instrument-sans)", fontWeight: 500, letterSpacing: "-0.01em" }}
          >
            adsq.me
          </Link>
        </div>
      </div>
    </footer>
  );
}
