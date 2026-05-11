import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  label: string;
  value: string;
  unit?: string;
  delta?: number; // percent change
  sparkline?: number[];
}

export function KpiTile({ label, value, unit, delta, sparkline }: Props) {
  const deltaUp = delta !== undefined && delta >= 0;
  return (
    <div className="bg-bg-1 border border-line rounded-md p-4 flex flex-col gap-2 min-h-[112px]">
      <div className="eyebrow">{label}</div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <div className="font-mono text-[28px] leading-none text-text" style={{ fontVariantNumeric: "tabular-nums" }}>
          {value}
        </div>
        {unit && <div className="font-mono text-[13px] text-text-3">{unit}</div>}
      </div>
      <div className="flex items-center justify-between mt-auto">
        {delta !== undefined ? (
          <div className={`flex items-center gap-1 font-mono text-[11px] ${deltaUp ? "text-green" : "text-rose"}`}>
            {deltaUp ? <TrendingUp size={11} strokeWidth={1.5} /> : <TrendingDown size={11} strokeWidth={1.5} />}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {deltaUp ? "+" : ""}
              {delta.toFixed(1)}%
            </span>
            <span className="text-text-4 ml-1">vs last wk</span>
          </div>
        ) : (
          <span />
        )}
        {sparkline && <Sparkline points={sparkline} positive={deltaUp} />}
      </div>
    </div>
  );
}

function Sparkline({ points, positive }: { points: number[]; positive: boolean; }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 60, h = 20;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="opacity-70">
      <path d={d} stroke={positive ? "var(--green)" : "var(--rose)"} strokeWidth={1.2} fill="none" />
    </svg>
  );
}
