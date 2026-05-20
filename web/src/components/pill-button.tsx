// pill button: primary uses an outer border + recessed filled inner button.
// secondary is a single-layer flat pill matching primary's outer dimensions.

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

const primaryInner = cn(
  "inline-flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-primary px-2.5 text-sm font-medium text-primary-foreground tracking-tight transition-all",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)]",
  "hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
);

const secondaryFlat = cn(
  "inline-flex h-[34px] cursor-pointer items-center justify-center gap-1.5 rounded-md border border-black/10 bg-card px-3 text-sm font-medium text-neutral-900 tracking-tight transition-colors",
  "hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
};

export function PillButton({ children, className, variant = "primary", ...props }: Props) {
  if (variant === "secondary") {
    return (
      <button className={cn(secondaryFlat, className)} {...props}>
        {children}
      </button>
    );
  }
  return (
    <div className="inline-flex h-[34px] items-center rounded-md border border-black/10 bg-card p-[2px]">
      <button className={cn(primaryInner, className)} {...props}>
        {children}
      </button>
    </div>
  );
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
};

export function PillButtonLink({ children, className, variant = "primary", ...props }: LinkProps) {
  if (variant === "secondary") {
    return (
      <a className={cn(secondaryFlat, "no-underline", className)} {...props}>
        {children}
      </a>
    );
  }
  return (
    <div className="inline-flex h-[34px] items-center rounded-md border border-black/10 bg-card p-[2px]">
      <a className={cn(primaryInner, "no-underline", className)} {...props}>
        {children}
      </a>
    </div>
  );
}
