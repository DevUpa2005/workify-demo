"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ChevronLeft, ChevronRight, Zap, Sparkles, Calendar as CalIcon } from "lucide-react";
import { useActivity, useActivityHydration, recordMeetingScheduled } from "@/lib/activity-store";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm"];

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const day = out.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  out.setDate(out.getDate() + diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const hydrated = useActivityHydration();
  const state = useActivity();
  const [weekOffset, setWeekOffset] = useState(0);
  const [autoLoading, setAutoLoading] = useState(false);

  const weekStart = addDays(startOfWeek(new Date()), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel = `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const visibleEvents = state.calendar.filter(ev => {
    const d = new Date(ev.start_at);
    return d >= weekStart && d < addDays(weekStart, 7);
  });

  const meetingsCount = visibleEvents.filter(e => e.type === "meeting").length;
  const followupCount = visibleEvents.filter(e => e.type === "auto-followup").length;

  async function autoSchedule() {
    // Pick the top 3 prospects from the activity store and schedule follow-ups for each
    const candidates = Object.values(state.prospects)
      .sort((a, b) => b.last_touched.localeCompare(a.last_touched))
      .slice(0, 3);

    if (candidates.length === 0) {
      // Nothing to auto-schedule yet
      return;
    }

    setAutoLoading(true);
    for (let i = 0; i < candidates.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      const p = candidates[i];
      recordMeetingScheduled({
        id: p.prospect_id,
        full_name: p.full_name,
        title: p.title,
        company: p.company,
        trust: p.trust
      }, {
        daysFromNow: 3 + i,
        hour: 10 + i,
        minute: 0,
        type: "auto-followup",
        label: "Follow up"
      });
    }
    setAutoLoading(false);
  }

  const hasAutoSchedulable = Object.keys(state.prospects).length > 0;

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">
            {weekLabel} · {visibleEvents.length} {visibleEvents.length === 1 ? "event" : "events"} · {meetingsCount} meeting{meetingsCount === 1 ? "" : "s"} · {followupCount} auto-followup{followupCount === 1 ? "" : "s"}
          </Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<ChevronLeft size={13} />} onClick={() => setWeekOffset(w => w - 1)} />
          <Button variant="secondary" size="md" onClick={() => setWeekOffset(0)}>Today</Button>
          <Button variant="ghost" size="sm" icon={<ChevronRight size={13} />} onClick={() => setWeekOffset(w => w + 1)} />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Week grid */}
        <div className="bg-bg-1 border border-line rounded-md overflow-hidden">
          {/* Day header */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-line">
            <div className="border-r border-line p-2"></div>
            {days.map((date, i) => {
              const isWeekend = i >= 5;
              const isToday = sameDay(date, new Date());
              return (
                <div key={i} className="p-2 border-r border-line last:border-r-0 text-center">
                  <div className="eyebrow mb-1">{DAYS[i]}</div>
                  <div
                    className={`font-mono text-[13px] ${isToday ? "text-cyan" : isWeekend ? "text-text-4" : "text-text"}`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hour rows */}
          {HOURS.map((hour, hIdx) => {
            const hourValue = hIdx + 8;
            return (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-line/60 last:border-b-0 min-h-[42px]">
                <div className="border-r border-line p-1.5 text-right">
                  <span className="font-mono text-[10px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>{hour}</span>
                </div>
                {days.map((day, dIdx) => {
                  const cellEvents = visibleEvents.filter(e => {
                    const d = new Date(e.start_at);
                    return sameDay(d, day) && d.getHours() === hourValue;
                  });
                  return (
                    <div key={dIdx} className="border-r border-line/60 last:border-r-0 p-1 space-y-1 relative">
                      {cellEvents.map(ev => {
                        const colors =
                          ev.type === "meeting" ? "border-l-cyan bg-cyan/5 text-cyan" :
                          ev.type === "auto-followup" ? "border-l-violet bg-violet/5 text-violet" :
                          "border-l-line-3 bg-bg-2 text-text-2";
                        return (
                          <Link
                            key={ev.id}
                            href={ev.prospect_id ? `/dossier/${ev.prospect_id}` : "#"}
                            className={`row-in block border-l-2 ${colors} px-1.5 py-1 rounded-sm hover:bg-opacity-20 transition-colors`}
                          >
                            <div className="font-mono text-[9px] opacity-70" style={{ fontVariantNumeric: "tabular-nums" }}>
                              {new Date(ev.start_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                            </div>
                            <div className="text-[10px] leading-tight truncate text-text">{ev.title}</div>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="bg-bg-1 border border-violet/30 rounded-md p-4">
            <Eyebrow className="text-violet mb-2">AI · Workify Scheduler</Eyebrow>
            <p className="text-[12px] text-text-2 leading-relaxed mb-3">
              {hasAutoSchedulable
                ? `Auto-schedule Day-3 follow-ups for your top ${Math.min(3, Object.keys(state.prospects).length)} active prospect${Object.keys(state.prospects).length === 1 ? "" : "s"}.`
                : "Send your first email to activate auto-scheduled Day-3 follow-ups."}
            </p>
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={autoSchedule}
              disabled={autoLoading || !hasAutoSchedulable}
              icon={autoLoading ? <Sparkles size={13} className="animate-pulse" /> : <Zap size={13} strokeWidth={2} />}
            >
              {autoLoading ? "Scheduling..." : hasAutoSchedulable ? `Auto-schedule ${Math.min(3, Object.keys(state.prospects).length)}` : "Auto-schedule"}
            </Button>
          </div>

          <div className="bg-bg-1 border border-line rounded-md p-4">
            <Eyebrow className="mb-3">Legend</Eyebrow>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-cyan rounded-sm" /><span className="text-text-2">Meeting</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-violet rounded-sm" /><span className="text-text-2">Auto follow-up</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-line-3 rounded-sm" /><span className="text-text-2">Email sent</span></div>
            </div>
          </div>

          {visibleEvents.length === 0 && (
            <div className="bg-bg-1 border border-line rounded-md p-4">
              <Eyebrow className="mb-2">Empty week</Eyebrow>
              <p className="text-[12px] text-text-3 leading-relaxed mb-3">
                Calendar items appear automatically when you send emails or schedule meetings.
              </p>
              <Link href="/leads">
                <Button variant="ghost" size="sm" icon={<CalIcon size={11} strokeWidth={1.5} />} className="w-full justify-center">
                  Browse leads
                </Button>
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
