import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function IconButton({
  children,
  label,
  onClick,
  disabled,
  destructive,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30",
        destructive &&
          "hover:border-[color:var(--color-destructive)] hover:text-[color:var(--color-destructive)]",
      )}
    >
      {children}
    </button>
  );
}
