import type { TrustTier } from "@/lib/types";

interface Props {
  tier: TrustTier;
  source?: string;
  size?: "sm" | "md";
}

const CONFIG: Record<TrustTier, { label: string; dot: string; text: string; border: string; }> = {
  verified: { label: "VERIFIED", dot: "bg-green",  text: "text-green",  border: "border-green/40" },
  likely:   { label: "LIKELY",   dot: "bg-cyan",   text: "text-cyan",   border: "border-cyan/40"  },
  inferred: { label: "INFERRED", dot: "bg-amber",  text: "text-amber",  border: "border-amber/40" },
  conflict: { label: "CONFLICT", dot: "bg-rose",   text: "text-rose",   border: "border-rose/40"  }
};

export function TrustBadge({ tier, source, size = "sm" }: Props) {
  const c = CONFIG[tier];
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${padding} border ${c.border} bg-bg-1 ${c.text} font-mono text-[10px] tracking-[0.14em] uppercase rounded-sm`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {c.label}
      {source && <span className="text-text-4 normal-case tracking-normal ml-1">· {source}</span>}
    </span>
  );
}
