import Link from "next/link";
import { NAV } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-pixel-square text-base text-foreground">ARPI</span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Lab
          </span>
        </Link>

        <nav className="flex items-center gap-5 sm:gap-7">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[12px] tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
