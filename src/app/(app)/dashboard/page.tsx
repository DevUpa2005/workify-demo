"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { KpiTile } from "@/components/ui/KpiTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Calendar as CalendarIcon, Mail, ArrowUpRight, MessageSquare, Sparkles, Upload,
  Users, ArrowRight
} from "lucide-react";
import {
  useActivity, useActivityHydration, selectReplyRate, selectHotProspects, fmtRelative,
  type ActivityEvent
} from "@/lib/activity-store";

const ACTIVITY_ICON: Record<string, any> = {
  email_sent: Mail,
  reply: MessageSquare,
  meeting_booked: CalendarIcon,
  generated: Sparkles,
  enrolled: Upload,
  stage_change: ArrowRight
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function buildWeekDays(): { label: string; date: Date; }[] {
  const today = new Date();
  // Find Monday of current week
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      date: d
    };
  });
}

export default function DashboardPage() {
  const hydrated = useActivityHydration();
  const state = useActivity();
  const [tick, setTick] = useState(0);

  // Re-render every 15s so relative timestamps stay current
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(i);
  }, []);

  const replyRate = selectReplyRate(state);
  const hot = selectHotProspects(state, 5);
  const weekDays = buildWeekDays();
  const hasAnyActivity = state.emails_sent > 0 || state.meetings_booked > 0 || state.events.length > 0;

  const dashSubtitle = hasAnyActivity
    ? `${state.emails_sent} emails sent · ${state.meetings_booked} meetings booked · ${state.replies_received} repl${state.replies_received === 1 ? "y" : "ies"} received`
    : "Your workspace starts empty. Head to Leads to send your first email.";

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">Workspace · Mike DiNunno · Paraform</Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Good afternoon, Mike.</h1>
          <p className="text-text-3 text-[13px] mt-1">{dashSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" icon={<Upload size={13} strokeWidth={1.5} />}>Bulk import</Button>
          <Link href="/scrape"><Button variant="primary" size="md" icon={<Sparkles size={13} strokeWidth={2} />}>New scrape</Button></Link>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-4 gap-4">
        <KpiTile
          label="Emails sent"
          value={state.emails_sent.toString()}
          delta={undefined}
          sparkline={[0, 0, 0, 0, 0, 0, state.emails_sent]}
        />
        <KpiTile
          label="Reply rate"
          value={replyRate === null ? "—" : replyRate.toFixed(1)}
          unit={replyRate === null ? "" : "%"}
          delta={undefined}
          sparkline={[0, 0, 0, 0, 0, 0, replyRate || 0]}
        />
        <KpiTile
          label="Meetings booked"
          value={state.meetings_booked.toString()}
          delta={undefined}
          sparkline={[0, 0, 0, 0, 0, 0, state.meetings_booked]}
        />
        <KpiTile
          label="Pipeline value"
          value={"$" + (state.pipeline_usd / 1000).toFixed(0) + "K"}
          delta={undefined}
          sparkline={[0, 0, 0, 0, 0, 0, state.pipeline_usd / 1000]}
        />
      </div>

      {/* This week — calendar strip */}
      <section>
        <SectionHeader
          eyebrow="This week"
          title="Calendar"
          actions={<Link href="/calendar"><Button variant="ghost" size="sm" icon={<ArrowUpRight size={12} strokeWidth={1.5} />}>Open calendar</Button></Link>}
        />
        <div className="bg-bg-1 border border-line rounded-md p-4">
          <div className="grid grid-cols-5 gap-3">
            {weekDays.map(({ label, date }) => {
              const dayEvents = state.calendar.filter(c => {
                const d = new Date(c.start_at);
                return d.getFullYear() === date.getFullYear() &&
                       d.getMonth() === date.getMonth() &&
                       d.getDate() === date.getDate();
              }).sort((a, b) => a.start_at.localeCompare(b.start_at));
              return (
                <div key={label} className="space-y-2">
                  <Eyebrow>{label}</Eyebrow>
                  {dayEvents.length === 0 && <div className="text-text-4 text-[11px] font-mono pt-1">—</div>}
                  {dayEvents.slice(0, 4).map(ev => {
                    const color =
                      ev.type === "meeting" ? "border-l-cyan" :
                      ev.type === "auto-followup" ? "border-l-violet" :
                      "border-l-line-3";
                    return (
                      <div
                        key={ev.id}
                        className={`bg-bg-2 border border-line border-l-2 ${color} rounded-sm p-2`}
                      >
                        <div className="font-mono text-[10px] text-text-3 mb-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {fmtTime(ev.start_at)}
                        </div>
                        <div className="text-[11px] text-text leading-tight">{ev.title}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Activity + Hot leads */}
      <div className="grid grid-cols-3 gap-6">
        {/* Activity */}
        <section className="col-span-2">
          <SectionHeader
            eyebrow="Real-time"
            title="Activity"
            actions={hasAnyActivity ? <TrustBadge tier="verified" source="LIVE" /> : undefined}
          />
          <div className="bg-bg-1 border border-line rounded-md">
            {state.events.length === 0 && (
              <div className="px-6 py-10 text-center">
                <div className="text-text-3 text-[13px] mb-3">No activity yet. Your moves show up here in real time.</div>
                <Link href="/leads">
                  <Button variant="secondary" size="sm" icon={<Users size={12} strokeWidth={1.5} />}>
                    Open Leads
                  </Button>
                </Link>
              </div>
            )}
            {state.events.length > 0 && (
              <div className="divide-y divide-line">
                {state.events.slice(0, 12).map((ev: ActivityEvent) => {
                  const Icon = ACTIVITY_ICON[ev.kind] || Mail;
                  return (
                    <div key={ev.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-bg-2/40 transition-colors">
                      <span
                        className="font-mono text-[10px] text-text-4 mt-1 w-16 shrink-0"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                        key={`ts-${ev.id}-${tick}`}
                      >
                        {fmtRelative(ev.ts)}
                      </span>
                      <Icon size={13} strokeWidth={1.5} className="text-text-3 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0 text-[12px] text-text-2 leading-snug">
                        <span className="text-text font-medium">{ev.who}</span>
                        <span className="text-text-3"> {ev.what}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Hot leads */}
        <section>
          <SectionHeader eyebrow="Hot now" title="Top prospects" />
          <div className="bg-bg-1 border border-line rounded-md">
            {hot.length === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-text-3 text-[12px] mb-1">Top prospects appear here</div>
                <div className="text-text-4 text-[11px] mb-3 leading-snug">as you generate, send, and schedule.</div>
                <Link href="/leads">
                  <Button variant="ghost" size="sm" icon={<ArrowRight size={11} strokeWidth={1.5} />}>
                    Browse leads
                  </Button>
                </Link>
              </div>
            )}
            {hot.length > 0 && (
              <div className="divide-y divide-line">
                {hot.map(p => (
                  <Link
                    key={p.prospect_id}
                    href={`/dossier/${p.prospect_id}`}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-bg-2/60 transition-colors"
                  >
                    <Avatar name={p.full_name} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-text truncate">{p.full_name}</div>
                      <div className="font-mono text-[10px] text-text-4 truncate" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {p.title}{p.company ? ` · ${p.company}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <TrustBadge tier={p.trust} />
                      <span className="font-mono text-[9px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {p.touches} {p.touches === 1 ? "touch" : "touches"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
