import { Eyebrow } from "@/components/ui/Eyebrow";
import { KpiTile } from "@/components/ui/KpiTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Avatar } from "@/components/ui/Avatar";
import { KPIS, ACTIVITY, CALENDAR_EVENTS, RECRUITERS } from "@/mocks/seed-data";
import { Calendar, Mail, ArrowUpRight, MessageSquare, PhoneCall, Sparkles, Upload } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ACTIVITY_ICON: Record<string, any> = {
  email_sent: Mail,
  reply: MessageSquare,
  meeting_booked: Calendar,
  call: PhoneCall,
  scraped: Sparkles,
  enrolled: Upload
};

function fmtRelative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">Workspace · Mike DiNunno · Paraform</Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Good afternoon, Mike.</h1>
          <p className="text-text-3 text-[13px] mt-1">11 prospects active in pipeline · 3 meetings booked this week · 1 reply waiting.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" icon={<Upload size={13} strokeWidth={1.5} />}>Bulk import</Button>
          <Link href="/scrape"><Button variant="primary" size="md" icon={<Sparkles size={13} strokeWidth={2} />}>New scrape</Button></Link>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-4 gap-4">
        <KpiTile
          label="Emails sent · 7d"
          value={KPIS.emails_sent.toString()}
          delta={KPIS.emails_sent_delta_pct}
          sparkline={[10, 22, 18, 28, 31, 24, 36]}
        />
        <KpiTile
          label="Reply rate · 7d"
          value={KPIS.reply_rate.toFixed(1)}
          unit="%"
          delta={KPIS.reply_rate_delta_pct}
          sparkline={[8.1, 9.4, 9.0, 10.2, 11.5, 11.2, 11.7]}
        />
        <KpiTile
          label="Meetings booked"
          value={KPIS.meetings_booked.toString()}
          delta={KPIS.meetings_booked_delta_pct}
          sparkline={[2, 1, 3, 2, 4, 3, 5]}
        />
        <KpiTile
          label="Pipeline value"
          value={"$" + (KPIS.pipeline_usd / 1000).toFixed(0) + "K"}
          delta={KPIS.pipeline_delta_pct}
          sparkline={[210, 245, 268, 290, 310, 332, 357]}
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
            {["Mon May 12", "Tue May 13", "Wed May 14", "Thu May 15", "Fri May 16"].map((day, i) => {
              const dayEvents = CALENDAR_EVENTS.filter(e => {
                const d = new Date(e.start_at);
                return d.getDay() === (i + 1) % 7;
              });
              return (
                <div key={day} className="space-y-2">
                  <Eyebrow>{day}</Eyebrow>
                  {dayEvents.length === 0 && <div className="text-text-4 text-[11px] font-mono pt-1">—</div>}
                  {dayEvents.map(ev => {
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
            actions={<TrustBadge tier="verified" source="LIVE" />}
          />
          <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
            {ACTIVITY.map(ev => {
              const Icon = ACTIVITY_ICON[ev.kind];
              return (
                <div key={ev.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-bg-2/40 transition-colors">
                  <span className="font-mono text-[10px] text-text-4 mt-1 w-12 shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
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
        </section>

        {/* Hot leads */}
        <section>
          <SectionHeader eyebrow="Hot now" title="Top prospects" />
          <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
            {RECRUITERS.slice(0, 5).map(r => (
              <Link
                key={r.id}
                href={`/dossier/${r.id}`}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-bg-2/60 transition-colors"
              >
                <Avatar name={r.full_name} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-text truncate">{r.full_name}</div>
                  <div className="font-mono text-[10px] text-text-4 truncate" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {r.title} · {r.company_id.toUpperCase()}
                  </div>
                </div>
                <TrustBadge tier={r.trust} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
