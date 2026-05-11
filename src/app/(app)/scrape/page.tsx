"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Search, Linkedin, FileSpreadsheet, Globe, Loader2, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { RECRUITERS } from "@/mocks/seed-data";
import type { TrustTier } from "@/lib/types";

type Source = "linkedin" | "apollo" | "hunter" | "csv";

interface SearchResult {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  title: string;
  company: string;
  location: string;
  email?: string;
  trust: TrustTier;
  resultSource: "linkdapi" | "seed";
  linkedin_url?: string;
  headline?: string;
  avatar_url?: string;
  about?: string;
  industry?: string;
  size?: string;
}

export default function ScrapePage() {
  return (
    <Suspense fallback={<div className="text-text-3 text-[12px]">Loading...</div>}>
      <ScrapePageInner />
    </Suspense>
  );
}

function ScrapePageInner() {
  const search = useSearchParams();
  const [source, setSource] = useState<Source>("linkedin");
  const [q, setQ] = useState(search?.get("q") || "");
  const [industry, setIndustry] = useState("SaaS / B2B");
  const [size, setSize] = useState("50–500");
  const [location, setLocation] = useState("US");
  const [role, setRole] = useState("Head of Talent · TA Director · People Lead");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [missMsg, setMissMsg] = useState("");

  async function runSearch(e?: FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setMissMsg("");
    setResults([]);

    // Start with any matches from the seeded prospect list (these are real demo data)
    const seeded = matchSeeded(q);

    let liveResult: SearchResult | null = null;
    try {
      const res = await fetch("/api/search-prospect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();

      if (data.status === "hit" && data.profile) {
        liveResult = {
          id: "live-" + Date.now(),
          full_name: data.profile.full_name,
          first_name: data.profile.first_name,
          last_name: data.profile.last_name,
          title: data.profile.title,
          company: data.profile.company,
          location: data.profile.location,
          trust: "verified",
          resultSource: "linkdapi",
          linkedin_url: data.profile.linkedin_url,
          headline: data.profile.headline,
          avatar_url: data.profile.avatar_url,
          about: data.profile.about
        };
      } else if (seeded.length === 0) {
        // No live result AND no seeded match — show honest empty state
        if (data.status === "error") {
          setMissMsg("LinkdAPI hit an error. Try again, or paste a full LinkedIn URL like linkedin.com/in/satyanadella");
        } else if (data.reason === "url_not_found") {
          setMissMsg(`LinkedIn returned no profile for "${data.attempted_slug}". The URL may be invalid or the profile may be private.`);
        } else {
          setMissMsg(`No match found. Try a full LinkedIn URL (e.g. linkedin.com/in/satyanadella) or one of the seeded prospects in your Leads list.`);
        }
      }
    } catch (err) {
      if (seeded.length === 0) {
        setMissMsg("Network error. Please try again.");
      }
    }

    // Stream results in (animated reveal)
    const combined = [...(liveResult ? [liveResult] : []), ...seeded];
    for (let i = 0; i < combined.length; i++) {
      await new Promise(r => setTimeout(r, 220 + Math.random() * 180));
      setResults(prev => [...prev, combined[i]]);
    }
    setLoading(false);
  }

  function matchSeeded(query: string): SearchResult[] {
    const lower = query.toLowerCase();
    return RECRUITERS
      .filter(r =>
        r.full_name.toLowerCase().includes(lower) ||
        r.title.toLowerCase().includes(lower) ||
        r.location?.toLowerCase().includes(lower)
      )
      .slice(0, 4)
      .map(r => ({
        id: r.id,
        full_name: r.full_name,
        first_name: r.first_name,
        last_name: r.last_name,
        title: r.title,
        company: r.headline?.split("@")[1]?.trim() || r.company_id,
        location: r.location || "",
        email: r.email,
        trust: r.trust,
        resultSource: "seed" as const,
        linkedin_url: r.linkedin_url,
        headline: r.headline
      }));
  }

  function getDossierHref(r: SearchResult): string {
    if (r.resultSource === "seed") return `/dossier/${r.id}`;
    // Live LinkdAPI result — encode profile in URL so the Dossier page can render it
    const payload = {
      full_name: r.full_name,
      first_name: r.first_name,
      last_name: r.last_name,
      title: r.title,
      company: r.company,
      email: r.email,
      location: r.location,
      linkedin_url: r.linkedin_url,
      headline: r.headline,
      avatar_url: r.avatar_url,
      about: r.about,
      industry: r.industry,
      size: r.size,
      source: "linkdapi" as const
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    return `/dossier/live?d=${encoded}`;
  }

  return (
    <div className="space-y-6 max-w-[1500px]">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">Source · {source.toUpperCase()} · {results.length} results</Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Scrape</h1>
          <p className="text-text-3 text-[13px] mt-1">Find and verify recruiter contacts. Paste a LinkedIn URL or search by name.</p>
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr_1fr] gap-4">
        {/* Source picker */}
        <div>
          <Eyebrow className="mb-2">Source</Eyebrow>
          <div className="bg-bg-1 border border-line rounded-md p-1.5 space-y-1">
            {[
              { id: "linkedin" as const, label: "LinkedIn", icon: Linkedin, badge: "LIVE" },
              { id: "apollo" as const,   label: "Apollo",   icon: Globe,    badge: "" },
              { id: "hunter" as const,   label: "Hunter",   icon: Search,   badge: "" },
              { id: "csv" as const,      label: "CSV",      icon: FileSpreadsheet, badge: "" }
            ].map(s => {
              const active = source === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setSource(s.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 h-8 rounded-sm text-left transition-colors ${
                    active ? "bg-bg-2 text-text" : "text-text-3 hover:text-text-2 hover:bg-bg-2/50"
                  }`}
                >
                  <Icon size={13} strokeWidth={1.5} />
                  <span className="text-[12px] flex-1">{s.label}</span>
                  {s.badge && active && (
                    <span className="font-mono text-[9px] text-cyan tracking-wider">{s.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter builder */}
        <div>
          <Eyebrow className="mb-2">Filters</Eyebrow>
          <div className="bg-bg-1 border border-line rounded-md p-3 space-y-2.5">
            <FilterRow label="Industry" value={industry} onChange={setIndustry} />
            <FilterRow label="Company size" value={size} onChange={setSize} />
            <FilterRow label="Location" value={location} onChange={setLocation} />
            <FilterRow label="Role title" value={role} onChange={setRole} />
          </div>
        </div>

        {/* Search input */}
        <div>
          <Eyebrow className="mb-2">Query</Eyebrow>
          <form onSubmit={runSearch} className="bg-bg-1 border border-line rounded-md p-3 space-y-2.5">
            <div className="relative">
              <Search size={13} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="linkedin.com/in/satyanadella"
                className="w-full h-9 bg-bg-2 border border-line rounded-sm pl-8 pr-3 text-[12px] text-text placeholder:text-text-4 focus:border-cyan"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              disabled={loading}
              icon={loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} strokeWidth={2} />}
            >
              {loading ? "Scraping..." : "Run scrape"}
            </Button>
            <div className="text-[10px] text-text-4 font-mono leading-relaxed">
              Best results: paste a LinkedIn URL.<br />
              Name search is hit-or-miss by design.
            </div>
          </form>
        </div>
      </div>

      {/* Results table */}
      <section>
        <SectionHeader
          eyebrow={loading ? "Running..." : results.length ? `${results.length} results` : "Awaiting query"}
          title="Live results"
          actions={
            loading ? (
              <div className="flex items-center gap-1.5 text-cyan font-mono text-[10px]">
                <Loader2 size={11} className="animate-spin" />
                <span className="pulse-cyan">LIVE</span>
              </div>
            ) : null
          }
        />
        <div className="bg-bg-1 border border-line rounded-md overflow-hidden">
          <div className="grid grid-cols-[40px_1.4fr_1fr_1fr_120px_140px_60px] px-4 py-2 border-b border-line bg-bg-2">
            <Eyebrow>#</Eyebrow>
            <Eyebrow>Name</Eyebrow>
            <Eyebrow>Title</Eyebrow>
            <Eyebrow>Company</Eyebrow>
            <Eyebrow>Location</Eyebrow>
            <Eyebrow>Trust</Eyebrow>
            <Eyebrow>Open</Eyebrow>
          </div>

          {results.length === 0 && !loading && !missMsg && (
            <div className="px-4 py-10 text-center text-text-4 text-[12px]">
              Run a scrape to see live results stream in.
            </div>
          )}

          {results.length === 0 && !loading && missMsg && (
            <div className="px-6 py-8 flex items-start gap-3">
              <AlertCircle size={16} strokeWidth={1.5} className="text-amber mt-0.5 shrink-0" />
              <div className="text-[12.5px] text-text-2 leading-relaxed">
                <div className="font-mono text-[10px] uppercase tracking-widest text-amber mb-1.5">No match</div>
                {missMsg}
              </div>
            </div>
          )}

          {results.map((r, i) => {
            const sourceLabel = r.resultSource === "linkdapi" ? "LinkdAPI" : "Seed";
            return (
              <Link
                key={r.id}
                href={getDossierHref(r)}
                className="row-in grid grid-cols-[40px_1.4fr_1fr_1fr_120px_140px_60px] px-4 h-12 items-center border-b border-line/60 hover:bg-bg-2/40 transition-colors cursor-pointer"
              >
                <span className="font-mono text-[11px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.full_name} src={r.avatar_url} size={24} />
                  <div>
                    <div className="text-[12px] text-text">{r.full_name}</div>
                    <div className="font-mono text-[10px] text-text-4">{r.email || "—"}</div>
                  </div>
                </div>
                <span className="text-[12px] text-text-2 truncate">{r.title || "—"}</span>
                <span className="text-[12px] text-text-2 truncate">{r.company || "—"}</span>
                <span className="font-mono text-[11px] text-text-3 truncate" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {r.location || "—"}
                </span>
                <TrustBadge tier={r.trust} source={sourceLabel} />
                <span className="text-text-3 hover:text-cyan">
                  <ExternalLink size={13} strokeWidth={1.5} />
                </span>
              </Link>
            );
          })}

          {loading && (
            <div className="px-4 h-12 flex items-center gap-3 border-b border-line/60">
              <Loader2 size={13} className="animate-spin text-cyan" />
              <span className="text-[12px] text-text-3 font-mono">Querying LinkdAPI...</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterRow({ label, value, onChange }: { label: string; value: string; onChange: (s: string) => void; }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-mono text-[10px] text-text-4 uppercase tracking-wider w-24 shrink-0">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 h-7 bg-bg-2 border border-line rounded-sm px-2 text-[11px] text-text focus:border-cyan font-mono"
      />
    </div>
  );
}
