// pill button: outer border container + recessed filled inner button.
// use for primary CTAs and action triggers.

import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
};

export function PillButton({ children, className, ...props }: Props) {
  return (
    <div className="inline-flex h-[34px] items-center rounded-md border border-black/10 bg-card p-[2px]">
      <button
        className={cn(
          "inline-flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-primary px-2.5 text-[13px] font-medium text-primary-foreground tracking-tight transition-all",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)]",
          "hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}

// link variant — wraps an <a> instead of a button
type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
  className?: string;
};

export function PillButtonLink({ children, className, ...props }: LinkProps) {
  return (
    <div className="inline-flex h-[34px] items-center rounded-md border border-black/10 bg-card p-[2px]">
      <a
        className={cn(
          "inline-flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-primary px-2.5 text-[13px] font-medium text-primary-foreground tracking-tight transition-all no-underline",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)]",
          "hover:bg-primary/90",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
        {...props}
      >
        {children}
      </a>
    </div>
  );
}
