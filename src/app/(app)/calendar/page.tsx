"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CALENDAR_EVENTS } from "@/mocks/seed-data";
import { ChevronLeft, ChevronRight, Zap, Sparkles } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm"];

function dayIndex(iso: string) {
  const d = new Date(iso).getDay();
  return d === 0 ? 6 : d - 1;
}

function hourIndex(iso: string) {
  return new Date(iso).getHours() - 8;
}

export default function CalendarPage() {
  const [events, setEvents] = useState(CALENDAR_EVENTS);
  const [autoLoading, setAutoLoading] = useState(false);

  async function autoSchedule() {
    setAutoLoading(true);
    // Animate 3 new auto-followup events landing on the grid
    const newEvents = [
      { id: "auto1", title: "Follow up — Daniel Okafor", start_at: "2026-05-14T10:00:00Z", end_at: "2026-05-14T10:05:00Z", type: "auto-followup" as const, recruiter_id: "r2" },
      { id: "auto2", title: "Follow up — Priya Iyer", start_at: "2026-05-15T16:00:00Z", end_at: "2026-05-15T16:05:00Z", type: "auto-followup" as const, recruiter_id: "r3" },
      { id: "auto3", title: "Follow up — Adaeze Nwosu", start_at: "2026-05-16T11:00:00Z", end_at: "2026-05-16T11:05:00Z", type: "auto-followup" as const, recruiter_id: "r7" }
    ];
    for (const ev of newEvents) {
      await new Promise(r => setTimeout(r, 600));
      setEvents(prev => [...prev, ev]);
    }
    setAutoLoading(false);
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">Week of May 12 · {events.length} events · 2 meetings · 4 auto-followups</Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<ChevronLeft size={13} />} />
          <Button variant="secondary" size="md">Today</Button>
          <Button variant="ghost" size="sm" icon={<ChevronRight size={13} />} />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Week grid */}
        <div className="bg-bg-1 border border-line rounded-md overflow-hidden">
          {/* Day header */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-line">
            <div className="border-r border-line p-2"></div>
            {DAYS.map((day, i) => {
              const date = 12 + i;
              return (
                <div key={day} className="p-2 border-r border-line last:border-r-0 text-center">
                  <div className="eyebrow mb-1">{day}</div>
                  <div className={`font-mono text-[13px] ${i < 5 ? "text-text" : "text-text-4"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                    May {date}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hour rows */}
          {HOURS.map((hour, hIdx) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-line/60 last:border-b-0 min-h-[42px]">
              <div className="border-r border-line p-1.5 text-right">
                <span className="font-mono text-[10px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>{hour}</span>
              </div>
              {DAYS.map((_, dIdx) => {
                const cellEvents = events.filter(e => dayIndex(e.start_at) === dIdx && hourIndex(e.start_at) === hIdx);
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
                          href={ev.recruiter_id ? `/dossier/${ev.recruiter_id}` : "#"}
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
          ))}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="bg-bg-1 border border-violet/30 rounded-md p-4">
            <Eyebrow className="text-violet mb-2">AI · Workify Scheduler</Eyebrow>
            <p className="text-[12px] text-text-2 leading-relaxed mb-3">
              Auto-schedule Day-3 follow-ups for 3 enrolled prospects awaiting their next touch.
            </p>
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={autoSchedule}
              disabled={autoLoading}
              icon={autoLoading ? <Sparkles size={13} className="animate-pulse" /> : <Zap size={13} strokeWidth={2} />}
            >
              {autoLoading ? "Scheduling..." : "Auto-schedule 3"}
            </Button>
          </div>

          <div className="bg-bg-1 border border-line rounded-md p-4">
            <Eyebrow className="mb-3">Legend</Eyebrow>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-cyan rounded-sm" /><span className="text-text-2">Meeting</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-violet rounded-sm" /><span className="text-text-2">Auto follow-up</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-line-3 rounded-sm" /><span className="text-text-2">Focus</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
