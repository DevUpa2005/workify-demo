"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Upload, FileSpreadsheet, Sparkles, Check, ArrowRight } from "lucide-react";

const STEPS = ["Upload", "Enrich", "Review", "Confirm"];

export default function BulkPage() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  async function runEnrich() {
    setStep(1);
    for (let i = 0; i <= 100; i += 4) {
      await new Promise(r => setTimeout(r, 80));
      setProgress(i);
    }
    setTimeout(() => setStep(2), 400);
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">Step {step + 1} of 4 · {STEPS[step]}</Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Bulk import</h1>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-sm border flex items-center justify-center font-mono text-[11px] ${
              i < step ? "bg-cyan/10 border-cyan/40 text-cyan" :
              i === step ? "bg-bg-2 border-cyan text-cyan" :
              "bg-bg-1 border-line text-text-4"
            }`}>
              {i < step ? <Check size={11} strokeWidth={2.5} /> : i + 1}
            </div>
            <div className="flex-1">
              <div className={`text-[12px] ${i <= step ? "text-text" : "text-text-4"}`}>{label}</div>
            </div>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-cyan/40" : "bg-line"}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <section className="bg-bg-1 border border-line rounded-md p-12 text-center">
          <FileSpreadsheet size={36} strokeWidth={1.2} className="text-text-3 mx-auto mb-4" />
          <h2 className="text-[17px] text-text font-semibold mb-2">Upload your prospect list</h2>
          <p className="text-[12px] text-text-3 mb-6 max-w-md mx-auto">
            CSV with at least a <span className="font-mono text-text">full_name</span> column. Or paste a list of LinkedIn URLs.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="secondary" size="md" icon={<Upload size={13} strokeWidth={1.5} />}>Upload CSV</Button>
            <Button variant="primary" size="md" onClick={runEnrich}>Continue with sample (12 rows)</Button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="bg-bg-1 border border-line rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Eyebrow tone="cyan" className="mb-1">Enriching 12 prospects</Eyebrow>
              <p className="text-[13px] text-text-2">Pulling LinkedIn profiles, verifying emails, scoring trust...</p>
            </div>
            <span className="font-mono text-[24px] text-cyan" style={{ fontVariantNumeric: "tabular-nums" }}>{progress}%</span>
          </div>
          <div className="h-1 bg-bg-3 rounded-sm overflow-hidden mb-6">
            <div className="h-full bg-cyan transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-1">
            {[
              "Sarah Chen — Head of People, Notion",
              "Marcus Aldridge — VP Talent, Linear",
              "Yuki Tanaka — Sr. Recruiter, Vercel",
              "Adaeze Nwosu — Director, People Ops, Maridian",
              "Tom Bergstrom — Talent Partner, Halcyon Cloud"
            ].slice(0, Math.floor(progress / 20)).map((name, i) => (
              <div key={i} className="row-in flex items-center gap-2 text-[12px] font-mono text-text-2" style={{ fontVariantNumeric: "tabular-nums" }}>
                <Check size={11} strokeWidth={2} className="text-green" />
                <span>{name}</span>
                <TrustBadge tier="verified" />
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <div className="grid grid-cols-[1.4fr_1fr] gap-6">
          <section>
            <SectionHeader eyebrow="Enriched" title="Review prospects" />
            <div className="bg-bg-1 border border-line rounded-md overflow-hidden">
              <div className="grid grid-cols-[1.5fr_1fr_120px] px-4 py-2 border-b border-line bg-bg-2">
                <Eyebrow>Name</Eyebrow>
                <Eyebrow>Company</Eyebrow>
                <Eyebrow>Trust</Eyebrow>
              </div>
              {[
                ["Sarah Chen", "Notion", "verified"],
                ["Marcus Aldridge", "Linear", "verified"],
                ["Yuki Tanaka", "Vercel", "likely"],
                ["Adaeze Nwosu", "Maridian Robotics", "verified"],
                ["Tom Bergstrom", "Halcyon Cloud", "likely"]
              ].map(([name, company, trust], i) => (
                <div key={i} className="grid grid-cols-[1.5fr_1fr_120px] px-4 h-11 items-center border-b border-line/60 last:border-b-0">
                  <span className="text-[12px] text-text">{name}</span>
                  <span className="font-mono text-[11px] text-text-3">{company}</span>
                  <TrustBadge tier={trust as any} />
                </div>
              ))}
            </div>
          </section>
          <section>
            <SectionHeader eyebrow="AI · Preview" title="Email draft" actions={<Sparkles size={13} strokeWidth={1.5} className="text-violet" />} />
            <div className="bg-bg-1 border border-line rounded-md p-4 space-y-3">
              <div>
                <Eyebrow className="mb-1">Subject</Eyebrow>
                <p className="text-[13px] text-text">21-day fills — worth a quick chat?</p>
              </div>
              <div>
                <Eyebrow className="mb-1">Body</Eyebrow>
                <p className="text-[12px] text-text-2 leading-relaxed">
                  {`{{first_name}} — saw {{company}} is hiring for {{role}}. Paraform's 21-day average fill rate (vs 60+ industry) might be worth 15 min. Worth a quick call?\n\nMike`}
                </p>
              </div>
              <Button variant="primary" size="md" className="w-full justify-center" onClick={() => setStep(3)} icon={<ArrowRight size={13} strokeWidth={2} />}>
                Enroll all 12
              </Button>
            </div>
          </section>
        </div>
      )}

      {step === 3 && (
        <section className="bg-bg-1 border border-green/30 rounded-md p-10 text-center">
          <div className="w-12 h-12 rounded-sm bg-green/10 border border-green/30 flex items-center justify-center mx-auto mb-4">
            <Check size={20} strokeWidth={2} className="text-green" />
          </div>
          <h2 className="text-[17px] text-text font-semibold mb-2">12 prospects enrolled</h2>
          <p className="text-[12px] text-text-3 mb-6">
            All emails sending over the next 6 hours. Day-3 follow-ups scheduled in your calendar.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
            <Stat label="Sent today" value="4" />
            <Stat label="Sending soon" value="8" />
            <Stat label="Follow-ups" value="12" />
          </div>
          <Button variant="primary" size="md" onClick={() => { setStep(0); setProgress(0); }}>Done</Button>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string; }) {
  return (
    <div className="bg-bg-2 border border-line rounded-sm p-3">
      <Eyebrow className="mb-1">{label}</Eyebrow>
      <div className="font-mono text-[20px] text-cyan" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
