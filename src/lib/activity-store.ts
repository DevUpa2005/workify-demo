"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

// Storage version — bump to force a one-time reset for all users.
// Current bump: v2 = clears the legacy seed-counter state and starts everyone at zero.
const STORAGE_KEY = "workify_activity_v2";

// === Types ===

export type ActivityEvent = {
  id: string;
  ts: string;            // ISO timestamp
  kind: "generated" | "email_sent" | "meeting_booked" | "reply" | "stage_change" | "enrolled";
  who: string;           // primary entity (prospect name or "You" or "Workify")
  what: string;          // human-readable description
  prospect_id?: string;  // for hot-prospect scoring
};

export type CalendarItem = {
  id: string;
  start_at: string;      // ISO
  title: string;
  type: "email" | "meeting" | "auto-followup";
  prospect_id?: string;
};

export type ProspectTouchScore = {
  prospect_id: string;
  full_name: string;
  title: string;
  company: string;
  trust: "verified" | "likely" | "inferred" | "conflict";
  score: number;
  touches: number;
  last_touched: string;
};

export type ActivityState = {
  emails_sent: number;
  meetings_booked: number;
  replies_received: number;
  pipeline_usd: number;
  events: ActivityEvent[];
  calendar: CalendarItem[];
  prospects: Record<string, ProspectTouchScore>;
};

const EMPTY_STATE: ActivityState = {
  emails_sent: 0,
  meetings_booked: 0,
  replies_received: 0,
  pipeline_usd: 0,
  events: [],
  calendar: [],
  prospects: {}
};

// Pipeline contribution per send. Matches avg value_usd of seeded prospects.
const PIPELINE_PER_SEND = 18000;

// Touch scoring weights
const SCORE = {
  generated: 1,
  email_sent: 1,
  meeting_booked: 3,
  reply: 5
};

// === Internal store ===

let memoryState: ActivityState = EMPTY_STATE;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
}

function loadFromStorage(): ActivityState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_STATE, ...parsed };
  } catch {
    return EMPTY_STATE;
  }
}

function saveToStorage(state: ActivityState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function setState(updater: (prev: ActivityState) => ActivityState) {
  memoryState = updater(memoryState);
  saveToStorage(memoryState);
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return memoryState;
}

// Server snapshot — always returns EMPTY_STATE to avoid hydration mismatches
function getServerSnapshot() {
  return EMPTY_STATE;
}

// === Helpers ===

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function bumpProspect(
  prev: ActivityState,
  prospect: { id: string; full_name: string; title: string; company: string; trust: ProspectTouchScore["trust"]; },
  delta: number
): Record<string, ProspectTouchScore> {
  const existing = prev.prospects[prospect.id];
  const updated: ProspectTouchScore = {
    prospect_id: prospect.id,
    full_name: prospect.full_name,
    title: prospect.title,
    company: prospect.company,
    trust: prospect.trust,
    score: (existing?.score || 0) + delta,
    touches: (existing?.touches || 0) + 1,
    last_touched: new Date().toISOString()
  };
  return { ...prev.prospects, [prospect.id]: updated };
}

// === Public actions ===

export type ProspectRef = {
  id: string;
  full_name: string;
  title: string;
  company: string;
  trust: ProspectTouchScore["trust"];
};

export function recordGenerated(p: ProspectRef) {
  const ev: ActivityEvent = {
    id: uid(),
    ts: new Date().toISOString(),
    kind: "generated",
    who: "You",
    what: `generated AI brief for ${p.full_name}`,
    prospect_id: p.id
  };
  setState(prev => ({
    ...prev,
    events: [ev, ...prev.events].slice(0, 60),
    prospects: bumpProspect(prev, p, SCORE.generated)
  }));
}

export function recordEmailSent(p: ProspectRef, sequence?: string) {
  const now = new Date();
  const ev: ActivityEvent = {
    id: uid(),
    ts: now.toISOString(),
    kind: "email_sent",
    who: "You",
    what: sequence
      ? `sent step 1/4 of "${sequence}" to ${p.full_name}`
      : `sent email to ${p.full_name}`,
    prospect_id: p.id
  };
  const cal: CalendarItem = {
    id: uid(),
    start_at: now.toISOString(),
    title: `Email — ${p.full_name}`,
    type: "email",
    prospect_id: p.id
  };
  setState(prev => ({
    ...prev,
    emails_sent: prev.emails_sent + 1,
    pipeline_usd: prev.pipeline_usd + PIPELINE_PER_SEND,
    events: [ev, ...prev.events].slice(0, 60),
    calendar: [cal, ...prev.calendar].slice(0, 200),
    prospects: bumpProspect(prev, p, SCORE.email_sent)
  }));
}

/**
 * Schedule a meeting `daysFromNow` days from today at `hour`:`minute`.
 * Default: 3 days from now at 9:30am — matches Workify's Day-3 follow-up promise.
 */
export function recordMeetingScheduled(
  p: ProspectRef,
  opts?: { daysFromNow?: number; hour?: number; minute?: number; type?: "meeting" | "auto-followup"; label?: string }
) {
  const daysFromNow = opts?.daysFromNow ?? 3;
  const hour = opts?.hour ?? 9;
  const minute = opts?.minute ?? 30;
  const type = opts?.type ?? "auto-followup";
  const label = opts?.label ?? "Follow up";

  const when = new Date();
  when.setDate(when.getDate() + daysFromNow);
  when.setHours(hour, minute, 0, 0);

  const dayLabel = when.toLocaleDateString("en-US", { weekday: "short" });
  const timeLabel = when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  setState(prev => {
    const ev: ActivityEvent = {
      id: uid(),
      ts: new Date().toISOString(),
      kind: "meeting_booked",
      who: "You",
      what: `scheduled ${label.toLowerCase()} with ${p.full_name} · ${dayLabel} ${timeLabel}`,
      prospect_id: p.id
    };
    const cal: CalendarItem = {
      id: uid(),
      start_at: when.toISOString(),
      title: `${label} — ${p.full_name}`,
      type,
      prospect_id: p.id
    };
    return {
      ...prev,
      meetings_booked: prev.meetings_booked + 1,
      events: [ev, ...prev.events].slice(0, 60),
      calendar: [cal, ...prev.calendar].slice(0, 200),
      prospects: bumpProspect(prev, p, SCORE.meeting_booked)
    };
  });
}

export function recordReply(p: ProspectRef, subject: string) {
  const ev: ActivityEvent = {
    id: uid(),
    ts: new Date().toISOString(),
    kind: "reply",
    who: p.full_name,
    what: `replied to "${subject}" — interested`,
    prospect_id: p.id
  };
  setState(prev => ({
    ...prev,
    replies_received: prev.replies_received + 1,
    events: [ev, ...prev.events].slice(0, 60),
    prospects: bumpProspect(prev, p, SCORE.reply)
  }));
}

export function recordEnrolled(p: ProspectRef, sequence: string) {
  const ev: ActivityEvent = {
    id: uid(),
    ts: new Date().toISOString(),
    kind: "enrolled",
    who: "You",
    what: `enrolled ${p.full_name} in "${sequence}"`,
    prospect_id: p.id
  };
  setState(prev => ({
    ...prev,
    events: [ev, ...prev.events].slice(0, 60)
  }));
}

export function resetActivity() {
  setState(() => ({ ...EMPTY_STATE }));
}

// === React hook ===

/**
 * Subscribe to the activity store. Returns the current state and re-renders on changes.
 * Uses useSyncExternalStore for SSR safety.
 */
export function useActivity() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * One-time client-side initializer. Loads from localStorage on mount.
 * Call this once in a top-level layout or page; it's idempotent.
 */
export function useActivityHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    memoryState = loadFromStorage();
    notify();
    setHydrated(true);
  }, []);
  return hydrated;
}

// === Derived selectors ===

export function selectReplyRate(state: ActivityState): number | null {
  if (state.emails_sent === 0) return null;
  return (state.replies_received / state.emails_sent) * 100;
}

export function selectHotProspects(state: ActivityState, limit = 5): ProspectTouchScore[] {
  return Object.values(state.prospects)
    .sort((a, b) => b.score - a.score || b.last_touched.localeCompare(a.last_touched))
    .slice(0, limit);
}

export function fmtRelative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 5) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const __PIPELINE_PER_SEND = PIPELINE_PER_SEND;
