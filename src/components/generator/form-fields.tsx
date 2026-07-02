import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-7 border-t border-border pt-6">
      <span className="u-eyebrow !text-[0.6rem]">{title}</span>
      <div className="mt-4 flex flex-col gap-5">{children}</div>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={htmlFor}
        className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3.5 py-3">
      <span className="u-eyebrow block !text-[0.55rem]">{label}</span>
      <strong className="mt-1.5 block text-lg font-normal leading-none">{value}</strong>
    </div>
  );
}

export function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3 px-3.5 py-3 transition-colors hover:bg-[color:var(--color-surface-alt)]"
    >
      <span className="text-sm">{label}</span>
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
    </label>
  );
}
