"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Recruiter, Company } from "@/lib/types";
import {
  Mail, Send, Sparkles, Calendar as CalIcon, Linkedin,
  Loader2, RefreshCw, Check, AlertCircle, Building2, MapPin,
  Briefcase, GraduationCap, FileText, Zap
} from "lucide-react";
import { recordGenerated, recordEmailSent, recordMeetingScheduled, recordReply, type ProspectRef } from "@/lib/activity-store";

type Tab = "person" | "company" | "why";

interface Props {
  recruiter: Recruiter;
  company: Company;
}

export function DossierClient({ recruiter, company }: Props) {
  const [tab, setTab] = useState<Tab>("person");

  // AI-generated content state
  const [pain, setPain] = useState<{ pain_points: string[]; why_now: string; angle: string; } | null>(null);
  const [painLoading, setPainLoading] = useState(false);

  const [email, setEmail] = useState<{ subject: string; body: string; } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [prep, setPrep] = useState<any>(null);
  const [prepLoading, setPrepLoading] = useState(false);

  const [sent, setSent] = useState(false);

  const prospectCtx = {
    full_name: recruiter.full_name,
    first_name: recruiter.first_name,
    title: recruiter.title,
    company: company.legal_name,
    company_industry: company.industry,
    company_size: company.size,
    recent_job_posting: company.hiring_signals?.[0]?.role,
    location: recruiter.location,
    about: recruiter.about,
    hiring_signals: company.hiring_signals?.map(h => `${h.role} (posted ${h.posted})`) || []
  };

  // Reference used by the activity store for hot-prospect scoring + display
  const prospectRef: ProspectRef = {
    id: recruiter.id,
    full_name: recruiter.full_name,
    title: recruiter.title || "",
    company: company.legal_name || "",
    trust: recruiter.trust
  };

  async function generatePain() {
    setPainLoading(true);
    try {
      const res = await fetch("/api/infer-pain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prospectCtx)
      });
      const data = await res.json();
      setPain(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPainLoading(false);
    }
  }

  async function generateEmail() {
    setEmailLoading(true);
    setSent(false);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prospectCtx)
      });
      const data = await res.json();
      setEmail(data);
    } catch (e) {
      console.error(e);
    } finally {
      setEmailLoading(false);
    }
  }

  async function generatePrep() {
    setPrepLoading(true);
    try {
      const res = await fetch("/api/prep-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prospectCtx)
      });
      const data = await res.json();
      setPrep(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPrepLoading(false);
    }
  }

  function sendEmail() {
    setSent(true);
    // Track in activity store: increment emails_sent, pipeline value, drop event on calendar
    recordEmailSent(prospectRef, "Series-C TA leaders");
    // Auto-schedule Day-3 follow-up (the core Workify promise) at the same time
    recordMeetingScheduled(prospectRef, { daysFromNow: 3, hour: 9, minute: 30, type: "auto-followup", label: "Follow up" });
    setTimeout(() => setSent(false), 4000);
  }

  function simulateReply() {
    const subject = email?.subject || "Quick thought on your hiring";
    recordReply(prospectRef, subject);
  }

  return (
    <div className="space-y-6 max-w-[1500px]">
      {/* Header strip */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <Avatar name={recruiter.full_name} src={recruiter.avatar_url} size={64} />
          <div>
            <Eyebrow tone="cyan" className="mb-2 flex items-center gap-2">
              Recruiter Dossier
              <TrustBadge tier={recruiter.trust} />
            </Eyebrow>
            <h1 className="serif text-[30px] leading-tight text-text">{recruiter.full_name}</h1>
            <p className="text-text-2 text-[13px] mt-1">{recruiter.title} · {company.legal_name}</p>
            <div className="flex items-center gap-4 mt-2 font-mono text-[11px] text-text-3" style={{ fontVariantNumeric: "tabular-nums" }}>
              <span className="flex items-center gap-1"><Mail size={11} strokeWidth={1.5} /> {recruiter.email}</span>
              {recruiter.location && <span className="flex items-center gap-1"><MapPin size={11} strokeWidth={1.5} /> {recruiter.location}</span>}
              {recruiter.linkedin_url && (
                <a href={recruiter.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-cyan">
                  <Linkedin size={11} strokeWidth={1.5} /> View on LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" icon={<CalIcon size={13} strokeWidth={1.5} />}>Book meeting</Button>
          <Button variant="primary" size="md" icon={<Send size={13} strokeWidth={2} />} onClick={() => setTab("why")}>Send sequence</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-line flex items-center gap-1">
        {([
          { id: "person" as const,  label: "Person",      icon: Briefcase },
          { id: "company" as const, label: "Company",     icon: Building2 },
          { id: "why" as const,     label: "Why & How",   icon: Sparkles, ai: true }
        ]).map(t => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 h-9 px-3 text-[12px] transition-colors ${
                active ? "text-text" : "text-text-3 hover:text-text-2"
              }`}
            >
              <Icon size={13} strokeWidth={1.5} />
              {t.label}
              {t.ai && <span className="font-mono text-[9px] text-violet tracking-wider ml-1">AI</span>}
              {active && <span className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-cyan" />}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "person" && <PersonTab recruiter={recruiter} company={company} />}
      {tab === "company" && <CompanyTab company={company} />}
      {tab === "why" && (
        <WhyTab
          recruiter={recruiter}
          company={company}
          prospectRef={prospectRef}
          pain={pain}
          painLoading={painLoading}
          generatePain={generatePain}
          email={email}
          emailLoading={emailLoading}
          generateEmail={generateEmail}
          prep={prep}
          prepLoading={prepLoading}
          generatePrep={generatePrep}
          sent={sent}
          sendEmail={sendEmail}
          simulateReply={simulateReply}
        />
      )}
    </div>
  );
}

// ============ PERSON TAB ============

function PersonTab({ recruiter, company }: { recruiter: Recruiter; company: Company; }) {
  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        {/* About */}
        {recruiter.about && (
          <section>
            <SectionHeader eyebrow="About" title="Snapshot" />
            <div className="bg-bg-1 border border-line rounded-md p-4">
              <p className="text-[13px] text-text-2 leading-relaxed">{recruiter.about}</p>
            </div>
          </section>
        )}

        {/* Experience */}
        <section>
          <SectionHeader eyebrow="Career" title="Experience" actions={<TrustBadge tier="verified" source="LinkedIn" />} />
          <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
            {recruiter.experience?.map((exp, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-text">{exp.title}</div>
                  <div className="font-mono text-[11px] text-text-3 mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {exp.company}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {exp.duration}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <SectionHeader eyebrow="Education" title="Schools" />
          <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
            {recruiter.education?.map((edu, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <GraduationCap size={14} strokeWidth={1.5} className="text-text-3" />
                <div>
                  <div className="text-[13px] text-text">{edu.school}</div>
                  {edu.degree && <div className="font-mono text-[11px] text-text-3 mt-0.5">{edu.degree}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right rail: contacts + signals */}
      <div className="space-y-6">
        <section>
          <SectionHeader eyebrow="Contacts" title="Reachable via" />
          <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
            <div className="px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={12} strokeWidth={1.5} className="text-text-3" />
                <span className="font-mono text-[11px] text-text" style={{ fontVariantNumeric: "tabular-nums" }}>{recruiter.email}</span>
              </div>
              <TrustBadge tier={recruiter.email_status} />
            </div>
            <div className="px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Linkedin size={12} strokeWidth={1.5} className="text-text-3" />
                <span className="text-[11px] text-text-2">LinkedIn DM</span>
              </div>
              <TrustBadge tier="verified" />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Signals" title="What we know" />
          <div className="space-y-2">
            {[...recruiter.signals, ...company.signals].slice(0, 5).map((s, i) => (
              <div key={i} className="bg-bg-1 border border-line rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <Eyebrow>{s.label}</Eyebrow>
                  <TrustBadge tier={s.trust} source={s.source} />
                </div>
                <div className="text-[12px] text-text-2">{s.value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ============ COMPANY TAB ============

function CompanyTab({ company }: { company: Company; }) {
  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        <section>
          <SectionHeader eyebrow="Legal" title="Entity" actions={<TrustBadge tier={company.trust} source="Companies House" />} />
          <div className="bg-bg-1 border border-line rounded-md p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <KV label="Legal name" value={company.legal_name} />
              <KV label="Domain" value={company.domain} mono />
              <KV label="HQ" value={company.hq_location || "—"} />
              <KV label="Founded" value={company.founded?.toString() || "—"} mono />
              <KV label="Industry" value={company.industry || "—"} />
              <KV label="Headcount" value={company.size || "—"} mono />
              <KV label="Funding stage" value={company.funding_stage || "—"} />
              <KV label="Funding total" value={company.funding_total || "—"} mono />
            </div>
            {company.description && (
              <div className="pt-3 border-t border-line">
                <p className="text-[13px] text-text-2 leading-relaxed">{company.description}</p>
              </div>
            )}
          </div>
        </section>

        {/* Hiring signals */}
        {company.hiring_signals && company.hiring_signals.length > 0 && (
          <section>
            <SectionHeader eyebrow="Open roles" title="Hiring signals" actions={<TrustBadge tier="verified" source="LinkedIn Jobs" />} />
            <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
              {company.hiring_signals.map((h, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={13} strokeWidth={1.5} className="text-text-3" />
                    <span className="text-[13px] text-text">{h.role}</span>
                  </div>
                  <span className="font-mono text-[11px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>
                    Posted {h.posted}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent news */}
        {company.recent_news && company.recent_news.length > 0 && (
          <section>
            <SectionHeader eyebrow="Press" title="Recent news" />
            <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
              {company.recent_news.map((n, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-[12px] text-text-2">{n.headline}</span>
                  <span className="font-mono text-[11px] text-text-4">{n.date} · {n.source}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="space-y-6">
        <section>
          <SectionHeader eyebrow="Signals" title="Why they're hot" />
          <div className="space-y-2">
            {company.signals.map((s, i) => (
              <div key={i} className="bg-bg-1 border border-line rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <Eyebrow>{s.label}</Eyebrow>
                  <TrustBadge tier={s.trust} source={s.source} />
                </div>
                <div className="text-[12px] text-text-2">{s.value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ============ WHY & HOW TAB (THE WOW MOMENT) ============

function WhyTab(props: any) {
  const {
    recruiter, prospectRef,
    pain, painLoading, generatePain,
    email, emailLoading, generateEmail,
    prep, prepLoading, generatePrep,
    sent, sendEmail, simulateReply
  } = props;

  return (
    <div className="space-y-6">
      {/* AI status banner */}
      <div className="bg-bg-1 border border-violet/30 rounded-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-violet/10 border border-violet/30 flex items-center justify-center">
            <Sparkles size={14} strokeWidth={1.5} className="text-violet" />
          </div>
          <div>
            <Eyebrow className="text-violet mb-1">Claude · sonnet-4.5</Eyebrow>
            <div className="text-[13px] text-text">AI rationale, email draft, and call prep — generated on demand</div>
          </div>
        </div>
        <Button variant="secondary" size="md" icon={<Zap size={13} strokeWidth={1.5} />} onClick={() => { recordGenerated(prospectRef); generatePain(); generateEmail(); generatePrep(); }}>
          Generate everything
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-6">
        {/* LEFT — pain points + prep brief */}
        <div className="space-y-6">
          {/* Pain points */}
          <section>
            <SectionHeader
              eyebrow="AI rationale"
              title="Inferred pain points"
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generatePain}
                  disabled={painLoading}
                  icon={painLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} strokeWidth={1.5} />}
                >
                  {pain ? "Regenerate" : "Generate"}
                </Button>
              }
            />
            <div className="bg-bg-1 border border-line rounded-md p-4 min-h-[180px]">
              {!pain && !painLoading && (
                <div className="text-text-4 text-[12px] flex items-center justify-center h-full">
                  Click <span className="font-mono text-cyan mx-1">Generate</span> to infer pain points.
                </div>
              )}
              {painLoading && (
                <div className="space-y-2.5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton h-4 rounded-sm" style={{ width: `${85 - i * 8}%` }} />
                  ))}
                </div>
              )}
              {pain && !painLoading && (
                <div className="space-y-3">
                  {pain.pain_points.map((p: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="font-mono text-[10px] text-violet w-5 shrink-0 mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
                        0{i + 1}
                      </span>
                      <span className="text-[12px] text-text-2 leading-relaxed">{p}</span>
                    </div>
                  ))}
                  <div className="border-t border-line pt-3 mt-3 space-y-2">
                    <div>
                      <Eyebrow className="mb-1">Why now</Eyebrow>
                      <p className="text-[12px] text-text-2 leading-relaxed">{pain.why_now}</p>
                    </div>
                    <div>
                      <Eyebrow className="mb-1">Suggested angle</Eyebrow>
                      <p className="text-[12px] text-cyan leading-relaxed">{pain.angle}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Prep brief */}
          <section>
            <SectionHeader
              eyebrow="Before the call"
              title="AI prep brief"
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generatePrep}
                  disabled={prepLoading}
                  icon={prepLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} strokeWidth={1.5} />}
                >
                  {prep ? "Regenerate" : "Generate"}
                </Button>
              }
            />
            <div className="bg-bg-1 border border-line rounded-md p-4 min-h-[180px]">
              {!prep && !prepLoading && (
                <div className="text-text-4 text-[12px] flex items-center justify-center h-full">
                  Generate a 1-page brief for your discovery call.
                </div>
              )}
              {prepLoading && <div className="space-y-2"><div className="skeleton h-4 rounded-sm w-3/4" /><div className="skeleton h-4 rounded-sm w-5/6" /><div className="skeleton h-4 rounded-sm w-2/3" /></div>}
              {prep && !prepLoading && (
                <div className="space-y-3">
                  <div>
                    <Eyebrow className="mb-1">Headline</Eyebrow>
                    <p className="serif text-[15px] text-text leading-snug">{prep.headline}</p>
                  </div>
                  <div className="border-t border-line pt-3 space-y-2">
                    <Eyebrow>Talking points</Eyebrow>
                    {prep.talking_points?.map((p: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-cyan font-mono text-[10px] mt-0.5">→</span>
                        <span className="text-[12px] text-text-2">{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-line pt-3">
                    <Eyebrow className="mb-1">Ideal outcome</Eyebrow>
                    <p className="text-[12px] text-cyan">{prep.ideal_outcome}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT — email draft (the magic) */}
        <section className="sticky top-[64px] self-start">
          <SectionHeader
            eyebrow="Personalized · Paraform pitch"
            title="Cold email draft"
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={generateEmail}
                disabled={emailLoading}
                icon={emailLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} strokeWidth={1.5} />}
              >
                {email ? "Regenerate" : "Generate"}
              </Button>
            }
          />
          <div className="bg-bg-1 border border-line rounded-md overflow-hidden">
            {/* Email header */}
            <div className="px-4 py-3 border-b border-line bg-bg-2 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-mono text-text-4 w-12">FROM</span>
                <span className="text-text">mike@paraform.com</span>
                <TrustBadge tier="verified" />
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-mono text-text-4 w-12">TO</span>
                <span className="text-text">{recruiter.email}</span>
                <TrustBadge tier={recruiter.email_status} />
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-mono text-text-4 w-12">SUBJ</span>
                <span className="text-text">{email?.subject || (emailLoading ? "" : "—")}</span>
                {emailLoading && !email && <span className="skeleton h-3 flex-1 rounded-sm" />}
              </div>
            </div>

            {/* Email body */}
            <div className="p-4 min-h-[280px]">
              {!email && !emailLoading && (
                <div className="text-text-4 text-[12px] flex flex-col items-center justify-center h-full gap-2">
                  <Sparkles size={20} strokeWidth={1.2} className="text-violet/50" />
                  <span>Click <span className="font-mono text-cyan">Generate</span> to draft a personalized cold email.</span>
                </div>
              )}
              {emailLoading && (
                <div className="space-y-2.5">
                  {[90, 85, 80, 92, 70, 88, 60].map((w, i) => (
                    <div key={i} className="skeleton h-3.5 rounded-sm" style={{ width: `${w}%` }} />
                  ))}
                </div>
              )}
              {email && !emailLoading && (
                <p className="text-[13px] text-text-2 leading-[1.7] whitespace-pre-wrap font-sans">{email.body}</p>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-line bg-bg-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-3 font-mono text-[10px]" style={{ fontVariantNumeric: "tabular-nums" }}>
                <Sparkles size={11} className="text-violet" />
                <span>Auto-creates Day-3 follow-up in calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Save draft</Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={sent ? <Check size={12} strokeWidth={2.5} /> : <Send size={12} strokeWidth={2} />}
                  onClick={sendEmail}
                  disabled={!email || sent}
                >
                  {sent ? "Sent · follow-up booked" : "Send + schedule"}
                </Button>
              </div>
            </div>
          </div>

          {sent && (
            <div className="row-in mt-3 bg-bg-1 border border-green/30 rounded-md p-3 flex items-center gap-3">
              <div className="w-6 h-6 rounded-sm bg-green/10 border border-green/30 flex items-center justify-center">
                <Check size={12} strokeWidth={2.5} className="text-green" />
              </div>
              <div className="flex-1">
                <Eyebrow className="text-green mb-1">Confirmed</Eyebrow>
                <p className="text-[12px] text-text-2">
                  Email sent to <span className="text-text">{recruiter.email}</span> · Day-3 follow-up auto-scheduled in Google Calendar
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<Mail size={11} strokeWidth={1.5} />}
                onClick={simulateReply}
                title="Demo: simulate a reply landing in your inbox"
              >
                Simulate reply
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function KV({ label, value, mono = false }: { label: string; value: string; mono?: boolean; }) {
  return (
    <div>
      <Eyebrow className="mb-1">{label}</Eyebrow>
      <div className={`text-[13px] text-text ${mono ? "font-mono" : ""}`} style={mono ? { fontVariantNumeric: "tabular-nums" } : undefined}>
        {value}
      </div>
    </div>
  );
}
