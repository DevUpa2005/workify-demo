// Workify domain types — match the data model from the design handoff

export type TrustTier = "verified" | "likely" | "inferred" | "conflict";

export type PipelineStage =
  | "new"
  | "researching"
  | "sequenced"
  | "replied"
  | "meeting"
  | "won";

export const PIPELINE_STAGES: { id: PipelineStage; label: string; }[] = [
  { id: "new", label: "New" },
  { id: "researching", label: "Researching" },
  { id: "sequenced", label: "Sequenced" },
  { id: "replied", label: "Replied" },
  { id: "meeting", label: "Meeting" },
  { id: "won", label: "Won" }
];

export type Provenance = "apollo" | "hunter" | "linkedin" | "companies-house" | "linkdapi" | "inferred";

export interface Signal {
  label: string;
  value: string;
  source: Provenance;
  trust: TrustTier;
}

export interface Company {
  id: string;
  legal_name: string;
  domain: string;
  trust: TrustTier;
  hq_location?: string;
  industry?: string;
  size?: string;
  funding_stage?: string;
  funding_total?: string;
  description?: string;
  founded?: number;
  signals: Signal[];
  hiring_signals?: { role: string; posted: string; }[];
  recent_news?: { headline: string; date: string; source: string; }[];
}

export interface Recruiter {
  id: string;
  company_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  email_status: TrustTier;
  trust: TrustTier;
  pipeline_stage: PipelineStage;
  linkedin_url?: string;
  location?: string;
  avatar_url?: string;
  headline?: string;
  about?: string;
  experience?: { title: string; company: string; duration: string; }[];
  education?: { school: string; degree?: string; }[];
  signals: Signal[];
  last_touch_at?: string;
  value_usd?: number;
}

export interface DossierData {
  recruiter: Recruiter;
  company: Company;
}

export interface SequenceStep {
  step_index: number;
  day_offset: number;
  subject: string;
  body: string;
  sent: number;
  opened: number;
  replied: number;
}

export interface Sequence {
  id: string;
  name: string;
  tone: string;
  status: "active" | "paused" | "draft";
  steps: SequenceStep[];
  total_sent: number;
  reply_rate: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  type: "meeting" | "auto-followup" | "focus";
  recruiter_id?: string;
}

export interface Call {
  id: string;
  recruiter_id: string;
  recruiter_name: string;
  recruiter_company: string;
  duration_sec: number;
  started_at: string;
  disposition: "connected" | "voicemail" | "no-answer" | "scheduled";
  sentiment: "positive" | "neutral" | "negative";
  summary?: string;
  action_items?: string[];
  transcript?: { speaker: "rep" | "prospect"; t: string; text: string; }[];
}

export interface ActivityEvent {
  id: string;
  ts: string;
  kind: "email_sent" | "reply" | "meeting_booked" | "call" | "enrolled" | "scraped";
  who: string;
  what: string;
}

export interface DashboardKPIs {
  emails_sent: number;
  emails_sent_delta_pct: number;
  reply_rate: number;
  reply_rate_delta_pct: number;
  meetings_booked: number;
  meetings_booked_delta_pct: number;
  pipeline_usd: number;
  pipeline_delta_pct: number;
}
