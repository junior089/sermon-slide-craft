import { cn } from "@/lib/utils";

export function InfoLine({
  label,
  value,
  wide,
}: {
  label: string;
  value?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn("rounded-md border border-border bg-background p-2", wide && "md:col-span-2")}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value || "Não informado"}</div>
    </div>
  );
}
