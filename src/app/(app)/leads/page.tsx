"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Avatar } from "@/components/ui/Avatar";
import { RECRUITERS, COMPANIES } from "@/mocks/seed-data";
import { PIPELINE_STAGES, type PipelineStage, type Recruiter } from "@/lib/types";
import { Filter, Plus } from "lucide-react";

function fmtUsd(n: number) {
  if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "K";
  return "$" + n;
}

function timeSince(iso?: string) {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export default function LeadsPage() {
  const [items, setItems] = useState<Recruiter[]>(RECRUITERS);
  const [dragId, setDragId] = useState<string | null>(null);

  function onDrop(stage: PipelineStage) {
    if (!dragId) return;
    setItems(prev => prev.map(r => r.id === dragId ? { ...r, pipeline_stage: stage } : r));
    setDragId(null);
  }

  return (
    <div className="space-y-6 max-w-[1800px]">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">Pipeline · 15 prospects · $357K value</Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Leads</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" icon={<Filter size={13} strokeWidth={1.5} />}>Filter</Button>
          <Button variant="primary" size="md" icon={<Plus size={13} strokeWidth={2} />}>Add lead</Button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => {
          const cards = items.filter(r => r.pipeline_stage === stage.id);
          const total = cards.reduce((acc, r) => acc + (r.value_usd || 0), 0);
          return (
            <div
              key={stage.id}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(stage.id)}
              className="w-[280px] shrink-0 bg-bg-1 border border-line rounded-md flex flex-col"
            >
              <div className="px-3 py-2.5 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-text font-medium">{stage.label}</span>
                  <span className="font-mono text-[11px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {cards.length}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-text-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {fmtUsd(total)}
                </span>
              </div>

              <div className="flex-1 p-2 space-y-2 min-h-[200px]">
                {cards.map(r => {
                  const company = COMPANIES.find(c => c.id === r.company_id);
                  return (
                    <Link
                      key={r.id}
                      href={`/dossier/${r.id}`}
                      draggable
                      onDragStart={() => setDragId(r.id)}
                      className="block bg-bg-2 border border-line rounded-sm p-3 hover:border-line-3 transition-colors group cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Avatar name={r.full_name} size={24} />
                          <div className="min-w-0">
                            <div className="serif text-[14px] leading-tight text-text truncate">{r.full_name}</div>
                            <div className="font-mono text-[10px] text-text-4 truncate mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
                              {company?.legal_name}
                            </div>
                          </div>
                        </div>
                        <TrustBadge tier={r.trust} />
                      </div>
                      <div className="text-[11px] text-text-3 truncate">{r.title}</div>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-line">
                        <span className="font-mono text-[10px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {timeSince(r.last_touch_at)}
                        </span>
                        {r.value_usd && (
                          <span className="font-mono text-[10px] text-cyan" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {fmtUsd(r.value_usd)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
                {cards.length === 0 && (
                  <div className="text-center font-mono text-[10px] text-text-4 py-8">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
