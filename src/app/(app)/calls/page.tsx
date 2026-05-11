"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Avatar } from "@/components/ui/Avatar";
import { CALLS } from "@/mocks/seed-data";
import { Phone, X, Volume2 } from "lucide-react";

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CallsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? CALLS.find(c => c.id === openId) : null;

  return (
    <div className="space-y-6 max-w-[1500px]">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">3 calls today · 2 connected · 1 voicemail</Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Calls</h1>
        </div>
        <Button variant="primary" size="md" icon={<Phone size={13} strokeWidth={2} />}>Start dialer</Button>
      </div>

      {/* Queue */}
      <section>
        <SectionHeader eyebrow="Today's queue" title="Up next" />
        <div className="bg-bg-1 border border-line rounded-md p-4 grid grid-cols-3 gap-3">
          {CALLS.slice(0, 3).map(c => (
            <div key={c.id} className="bg-bg-2 border border-line rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Avatar name={c.recruiter_name} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-text truncate">{c.recruiter_name}</div>
                  <div className="font-mono text-[10px] text-text-4 truncate">{c.recruiter_company}</div>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full justify-center" icon={<Phone size={11} strokeWidth={1.5} />}>
                Dial
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section>
        <SectionHeader eyebrow="History" title="Call log" />
        <div className="bg-bg-1 border border-line rounded-md overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_120px_120px_120px_120px] px-4 py-2 border-b border-line bg-bg-2">
            <Eyebrow>Prospect</Eyebrow>
            <Eyebrow>When</Eyebrow>
            <Eyebrow>Duration</Eyebrow>
            <Eyebrow>Disposition</Eyebrow>
            <Eyebrow>Sentiment</Eyebrow>
            <Eyebrow>Action</Eyebrow>
          </div>
          {CALLS.map(c => (
            <button
              key={c.id}
              onClick={() => setOpenId(c.id)}
              className="w-full text-left grid grid-cols-[1.4fr_1fr_120px_120px_120px_120px] px-4 h-12 items-center border-b border-line/60 last:border-b-0 hover:bg-bg-2/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Avatar name={c.recruiter_name} size={24} />
                <div>
                  <div className="text-[12px] text-text">{c.recruiter_name}</div>
                  <div className="font-mono text-[10px] text-text-4">{c.recruiter_company}</div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-text-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                {new Date(c.started_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
              </span>
              <span className="font-mono text-[11px] text-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                {c.duration_sec > 0 ? fmtDuration(c.duration_sec) : "—"}
              </span>
              <TrustBadge tier={c.disposition === "connected" ? "verified" : c.disposition === "voicemail" ? "likely" : "inferred"} source={c.disposition} />
              <span className={`font-mono text-[10px] uppercase tracking-wider ${
                c.sentiment === "positive" ? "text-green" : (c.sentiment as string) === "negative" ? "text-rose" : "text-text-3"
              }`}>
                {c.sentiment}
              </span>
              <span className="text-[12px] text-cyan">View transcript →</span>
            </button>
          ))}
        </div>
      </section>

      {/* Transcript drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setOpenId(null)}>
          <div
            className="bg-bg-1 border-t border-line w-full max-w-[1100px] max-h-[80vh] rounded-t-md overflow-hidden flex flex-col row-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 size={14} strokeWidth={1.5} className="text-cyan" />
                <Eyebrow tone="cyan">Call transcript</Eyebrow>
                <span className="text-text-4 text-[11px]">·</span>
                <span className="text-[12px] text-text">{open.recruiter_name} · {open.recruiter_company}</span>
                <span className="font-mono text-[11px] text-text-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {fmtDuration(open.duration_sec)}
                </span>
              </div>
              <button onClick={() => setOpenId(null)} className="text-text-3 hover:text-text">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-[1fr_320px]">
              {/* Transcript */}
              <div className="p-5 space-y-3">
                <Eyebrow>Transcript</Eyebrow>
                {open.transcript ? open.transcript.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="font-mono text-[11px] text-text-4 w-12 shrink-0 mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>{t.t}</span>
                    <div className="flex-1">
                      <Eyebrow className={t.speaker === "rep" ? "text-cyan mb-1" : "text-text-3 mb-1"}>
                        {t.speaker === "rep" ? "Mike · Paraform" : open.recruiter_name}
                      </Eyebrow>
                      <p className="text-[13px] text-text-2 leading-relaxed">{t.text}</p>
                    </div>
                  </div>
                )) : <p className="text-[12px] text-text-4">No transcript — call did not connect.</p>}
              </div>

              {/* Summary rail */}
              <aside className="border-l border-line p-5 space-y-4 bg-bg-2/30">
                <div>
                  <Eyebrow className="mb-2">AI Summary</Eyebrow>
                  <p className="text-[12px] text-text-2 leading-relaxed">{open.summary}</p>
                </div>
                {open.action_items && (
                  <div>
                    <Eyebrow className="mb-2">Action items</Eyebrow>
                    <ul className="space-y-2">
                      {open.action_items.map((a, i) => (
                        <li key={i} className="text-[12px] text-text-2 flex items-start gap-2">
                          <span className="text-cyan font-mono text-[10px] mt-0.5">→</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link href={`/dossier/${open.recruiter_id}`}>
                  <Button variant="secondary" size="sm" className="w-full justify-center mt-2">View dossier</Button>
                </Link>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
