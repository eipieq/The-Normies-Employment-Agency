import Link from "next/link";

export function Section({
  label,
  title,
  children,
  className = "",
}: {
  label?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t border-border py-14 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {label && <p className="label mb-3">{label}</p>}
        {title && (
          <h2 className="mb-8 max-w-2xl font-pixel-square text-xl leading-snug text-foreground sm:text-2xl">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}

export function Lede({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose-lab max-w-2xl text-[15px] sm:text-base">{children}</div>
  );
}

/** numbered step in the methodology pipeline */
export function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 border-t border-border py-7 sm:grid-cols-[4rem_1fr] sm:gap-8">
      <p className="font-mono text-[13px] text-muted-foreground sm:pt-0.5">{n}</p>
      <div>
        <h3 className="mb-2 font-pixel-square text-base text-foreground">{title}</h3>
        <div className="prose-lab max-w-2xl text-[15px]">{children}</div>
      </div>
    </div>
  );
}

/** the two failure modes / research questions — a bordered card with a label */
export function Card({
  label,
  title,
  children,
}: {
  label?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-border p-5 sm:p-6">
      {label && <p className="label mb-2.5">{label}</p>}
      <h3 className="mb-2 font-pixel-square text-[15px] leading-snug text-foreground">
        {title}
      </h3>
      <div className="prose-lab text-[14px]">{children}</div>
    </div>
  );
}

export function PillLink({
  href,
  external = false,
  variant = "primary",
  children,
}: {
  href: string;
  external?: boolean;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  const cls =
    variant === "primary"
      ? "bg-foreground text-background hover:opacity-90"
      : "border border-border text-foreground hover:bg-muted";

  const content = (
    <span
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[14px] font-medium transition ${cls}`}
    >
      {children}
    </span>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return <Link href={href}>{content}</Link>;
}
