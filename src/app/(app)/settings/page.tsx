"use client";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { useState } from "react";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "inboxes", label: "Sending inboxes" },
  { id: "integrations", label: "Integrations" },
  { id: "gdpr", label: "GDPR & data" },
  { id: "api", label: "API keys" },
  { id: "billing", label: "Billing" }
];

const INTEGRATIONS = [
  { name: "Apollo",        connected: false, desc: "Prospect enrichment + contact database" },
  { name: "Hunter",        connected: false, desc: "Email verification + finder" },
  { name: "LinkdAPI",      connected: true,  desc: "LinkedIn profile data" },
  { name: "Twilio",        connected: false, desc: "Programmable voice + SMS" },
  { name: "Google Calendar", connected: true, desc: "Calendar sync + auto-scheduling" },
  { name: "Gmail",         connected: true,  desc: "Send sequences from your inbox" }
];

export default function SettingsPage() {
  const [section, setSection] = useState("profile");

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <Eyebrow tone="cyan" className="mb-2">Workspace · Paraform</Eyebrow>
        <h1 className="serif text-[30px] leading-tight text-text">Settings</h1>
      </div>

      <div className="grid grid-cols-[200px_1fr] gap-6">
        <nav className="space-y-0.5">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`w-full text-left px-3 h-8 rounded-sm text-[12px] transition-colors ${
                section === s.id ? "bg-bg-2 text-text" : "text-text-3 hover:text-text-2"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {section === "profile" && (
            <section>
              <SectionHeader eyebrow="Account" title="Profile" />
              <div className="bg-bg-1 border border-line rounded-md p-5 space-y-4">
                <Field label="Full name"  value="Mike DiNunno" />
                <Field label="Email"      value="mdinunno759@gmail.com" mono />
                <Field label="Company"    value="Paraform" />
                <Field label="Role"       value="Founder · Sales lead" />
                <Field label="Timezone"   value="America/Chicago" mono />
                <Field label="Signature"  value="Mike — paraform.com · 21-day fill rate" />
              </div>
            </section>
          )}

          {section === "inboxes" && (
            <section>
              <SectionHeader eyebrow="Sending" title="Inboxes" actions={<Button variant="primary" size="sm">Connect inbox</Button>} />
              <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
                <Inbox email="mike@paraform.com" provider="Gmail" dailyCap={120} sent={47} />
                <Inbox email="mike.dinunno@paraform.com" provider="Gmail" dailyCap={120} sent={32} />
              </div>
            </section>
          )}

          {section === "integrations" && (
            <section>
              <SectionHeader eyebrow="Connected services" title="Integrations" />
              <div className="grid grid-cols-2 gap-3">
                {INTEGRATIONS.map(int => (
                  <div key={int.name} className="bg-bg-1 border border-line rounded-md p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[13px] text-text">{int.name}</div>
                      <TrustBadge tier={int.connected ? "verified" : "inferred"} source={int.connected ? "live" : "not connected"} />
                    </div>
                    <p className="text-[11px] text-text-3 mb-3">{int.desc}</p>
                    <Button variant={int.connected ? "ghost" : "secondary"} size="sm" className="w-full justify-center">
                      {int.connected ? "Manage" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === "gdpr" && (
            <section>
              <SectionHeader eyebrow="Data rights" title="GDPR" />
              <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
                <Row label="Export workspace data" sub="Get a full archive of your prospects, sequences, and history." action="Request export" />
                <Row label="Suppression list" sub="173 emails currently suppressed (unsubscribes + bounces)." action="View list" />
                <Row label="Delete workspace" sub="Permanently delete all data. Cannot be undone." action="Delete" danger />
              </div>
            </section>
          )}

          {section === "api" && (
            <section>
              <SectionHeader eyebrow="Developer" title="API keys" actions={<Button variant="primary" size="sm">Generate key</Button>} />
              <div className="bg-bg-1 border border-line rounded-md divide-y divide-line">
                <Row label="Production key" sub="wk_live_••••••••••••••••3f8a" action="Reveal" mono />
                <Row label="Test key" sub="wk_test_••••••••••••••••a17c" action="Reveal" mono />
              </div>
            </section>
          )}

          {section === "billing" && (
            <section>
              <SectionHeader eyebrow="Plan" title="Billing" />
              <div className="bg-bg-1 border border-line rounded-md p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Eyebrow tone="cyan" className="mb-1">Current plan</Eyebrow>
                    <div className="serif text-[22px] text-text">Starter</div>
                    <p className="text-[12px] text-text-3 mt-1">2 mailboxes · 1,000 emails / month · all integrations</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[24px] text-text" style={{ fontVariantNumeric: "tabular-nums" }}>$49</div>
                    <Eyebrow>/ month</Eyebrow>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-line">
                  <Button variant="secondary" size="md">Change plan</Button>
                  <Button variant="ghost" size="md">View invoices</Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean; }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-3">
      <Eyebrow>{label}</Eyebrow>
      <input
        defaultValue={value}
        className={`h-8 bg-bg-2 border border-line rounded-sm px-2.5 text-[13px] text-text focus:border-cyan ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}

function Inbox({ email, provider, dailyCap, sent }: { email: string; provider: string; dailyCap: number; sent: number; }) {
  const pct = (sent / dailyCap) * 100;
  return (
    <div className="px-4 py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[12px] text-text" style={{ fontVariantNumeric: "tabular-nums" }}>{email}</div>
        <div className="font-mono text-[10px] text-text-4 mt-0.5">{provider}</div>
      </div>
      <div className="w-32">
        <div className="font-mono text-[10px] text-text-3 mb-1 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
          {sent} / {dailyCap}
        </div>
        <div className="h-1 bg-bg-3 rounded-sm overflow-hidden">
          <div className="h-full bg-cyan" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <TrustBadge tier="verified" />
    </div>
  );
}

function Row({ label, sub, action, danger, mono }: { label: string; sub: string; action: string; danger?: boolean; mono?: boolean; }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="text-[13px] text-text mb-0.5">{label}</div>
        <div className={`text-[11px] text-text-3 ${mono ? "font-mono" : ""}`} style={mono ? { fontVariantNumeric: "tabular-nums" } : undefined}>
          {sub}
        </div>
      </div>
      <Button variant={danger ? "danger" : "secondary"} size="sm">{action}</Button>
    </div>
  );
}
