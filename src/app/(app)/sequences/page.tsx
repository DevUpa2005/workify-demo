"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { SEQUENCES } from "@/mocks/seed-data";
import { Plus, Mail, Clock, MoreHorizontal, Play, Pause } from "lucide-react";

export default function SequencesPage() {
  const [activeId, setActiveId] = useState(SEQUENCES[0].id);
  const active = SEQUENCES.find(s => s.id === activeId)!;

  return (
    <div className="space-y-6 max-w-[1500px]">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">3 active · 269 emails sent · 12.4% reply rate</Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Sequences</h1>
        </div>
        <Button variant="primary" size="md" icon={<Plus size={13} strokeWidth={2} />}>New sequence</Button>
      </div>

      <div className="grid grid-cols-[340px_1fr] gap-6">
        {/* Left — sequence list */}
        <section>
          <SectionHeader eyebrow="All sequences" title="Pipeline" />
          <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
            {SEQUENCES.map(s => {
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${isActive ? "bg-bg-2" : "hover:bg-bg-2/40"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-text">{s.name}</span>
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${
                      s.status === "active" ? "text-green" : s.status === "paused" ? "text-amber" : "text-text-4"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px] text-text-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <span>{s.total_sent} sent</span>
                    <span className="text-text-4">·</span>
                    <span className="text-cyan">{s.reply_rate.toFixed(1)}% reply</span>
                  </div>
                  {/* Performance bar */}
                  <div className="mt-2 h-1 bg-bg-3 rounded-sm overflow-hidden">
                    <div className="h-full bg-cyan" style={{ width: `${Math.min(s.reply_rate * 5, 100)}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right — step builder */}
        <section>
          <SectionHeader
            eyebrow={`Sequence · ${active.tone}`}
            title={active.name}
            actions={
              <>
                <Button variant="ghost" size="sm" icon={<Pause size={12} strokeWidth={1.5} />}>Pause</Button>
                <Button variant="secondary" size="sm" icon={<MoreHorizontal size={12} strokeWidth={1.5} />} />
              </>
            }
          />
          <div className="space-y-2">
            {active.steps.map((step, i) => (
              <div key={i} className="bg-bg-1 border border-line rounded-md">
                <div className="px-4 py-3 flex items-center gap-4 border-b border-line">
                  <div className="w-8 h-8 rounded-sm bg-bg-2 border border-line flex items-center justify-center font-mono text-[11px] text-cyan" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {String(step.step_index).padStart(2, "0")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} strokeWidth={1.5} className="text-text-3" />
                    <span className="font-mono text-[11px] text-text-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                      Day {step.day_offset === 0 ? "0 · first touch" : `+${step.day_offset}`}
                    </span>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-4 font-mono text-[11px]" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <span className="text-text-3">{step.sent} sent</span>
                    <span className="text-text-3">{step.opened} opened</span>
                    <span className="text-cyan">{step.replied} replied</span>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-start gap-3">
                  <Mail size={13} strokeWidth={1.5} className="text-text-3 mt-1" />
                  <div className="flex-1">
                    <div className="text-[13px] text-text mb-1">{step.subject}</div>
                    <div className="text-[12px] text-text-3 line-clamp-2">{step.body}</div>
                  </div>
                  <TrustBadge tier="verified" />
                </div>
              </div>
            ))}
            <button className="w-full bg-bg-1 border border-dashed border-line rounded-md h-12 text-text-3 hover:text-text-2 hover:border-line-3 text-[12px] flex items-center justify-center gap-2 transition-colors">
              <Plus size={13} strokeWidth={1.5} />
              Add step
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
