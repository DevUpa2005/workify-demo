"use client";

import { useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  Upload, FileSpreadsheet, Sparkles, Check, AlertCircle,
  Loader2, X, Linkedin, Wand2, FileText, Users, ArrowRight
} from "lucide-react";
import { recordEnrolled } from "@/lib/activity-store";

type Mode = "upload" | "generate";

interface BulkRow {
  index: number;
  status: "hit" | "miss" | "error" | "pending";
  source: "linkdapi" | "csv" | "ai_generated";
  full_name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company?: string;
  email?: string;
  location?: string;
  linkedin_url?: string;
  industry?: string;
  size?: string;
  stage?: string;
  why_hot?: string[];
  pain_points?: string[];
  selected: boolean;
  imported?: boolean;
}

// Parse a CSV string into rows of {full_name, email, company, title, location}
// Tolerant to common column-name variations
function parseCSV(text: string): Array<Partial<BulkRow>> {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  // Split CSV line respecting quotes
  function splitLine(line: string): string[] {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { out.push(cur); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map(s => s.trim());
  }

  const headerCells = splitLine(lines[0]).map(h => h.toLowerCase());
  const colIdx = (...names: string[]) => {
    for (const n of names) {
      const i = headerCells.indexOf(n);
      if (i !== -1) return i;
    }
    return -1;
  };

  const nameIdx = colIdx("full_name", "name", "fullname", "full name");
  const firstIdx = colIdx("first_name", "firstname", "first");
  const lastIdx = colIdx("last_name", "lastname", "last");
  const emailIdx = colIdx("email", "email_address", "e-mail");
  const companyIdx = colIdx("company", "organization", "org", "employer");
  const titleIdx = colIdx("title", "role", "position", "job_title");
  const locationIdx = colIdx("location", "city", "geo");
  const linkedinIdx = colIdx("linkedin", "linkedin_url", "linkedin_profile", "url");

  return lines.slice(1).map(line => {
    const cells = splitLine(line);
    let full_name = nameIdx !== -1 ? cells[nameIdx] : "";
    if (!full_name && firstIdx !== -1) {
      full_name = `${cells[firstIdx] || ""} ${lastIdx !== -1 ? cells[lastIdx] || "" : ""}`.trim();
    }
    const linkedinUrl = linkedinIdx !== -1 ? cells[linkedinIdx] : "";
    return {
      full_name: full_name || linkedinUrl || "(unknown)",
      email: emailIdx !== -1 ? cells[emailIdx] : "",
      company: companyIdx !== -1 ? cells[companyIdx] : "",
      title: titleIdx !== -1 ? cells[titleIdx] : "",
      location: locationIdx !== -1 ? cells[locationIdx] : ""
    };
  });
}

export default function BulkPage() {
  const [mode, setMode] = useState<Mode>("upload");

  // CSV upload state
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvParsed, setCsvParsed] = useState<Array<Partial<BulkRow>>>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // AI generation state
  const [filterIndustry, setFilterIndustry] = useState("Health Tech");
  const [filterRole, setFilterRole] = useState("Head of Talent · VP People");
  const [filterLocation, setFilterLocation] = useState("United States");
  const [filterCount, setFilterCount] = useState(10);

  // Shared enrichment + results state
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState({ done: 0, total: 0 });
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [error, setError] = useState("");

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setCsvParsed(parsed);
      setCsvFileName(file.name);
      setRows([]);
      setError("");
    };
    reader.readAsText(file);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type.includes("csv"))) handleFile(file);
    else setError("Please drop a .csv file.");
  }

  async function runEnrichment(inputRows: Array<Partial<BulkRow>>) {
    if (inputRows.length === 0) return;
    setEnriching(true);
    setError("");
    setEnrichProgress({ done: 0, total: inputRows.length });

    // Initialize all rows in pending state so the table is visible during streaming
    const pending: BulkRow[] = inputRows.map((r, i) => ({
      index: i,
      status: "pending",
      source: "csv",
      full_name: r.full_name || "(unknown)",
      title: r.title,
      company: r.company,
      email: r.email,
      location: r.location,
      selected: true
    }));
    setRows(pending);

    // Batch in chunks of 5 to keep the API endpoint responsive
    const CHUNK = 5;
    const final: BulkRow[] = [];
    for (let i = 0; i < inputRows.length; i += CHUNK) {
      const chunk = inputRows.slice(i, i + CHUNK);
      try {
        const res = await fetch("/api/bulk-enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: chunk.map(r => ({
              query: r.full_name?.startsWith("linkedin") ? r.full_name : undefined,
              full_name: r.full_name,
              email: r.email,
              company: r.company,
              title: r.title,
              location: r.location
            }))
          })
        });
        const data = await res.json();
        const results = (data.results || []) as Omit<BulkRow, "selected">[];
        results.forEach((row, j) => {
          const globalIdx = i + j;
          final[globalIdx] = { ...row, index: globalIdx, selected: row.status !== "error" };
        });
        setRows([...final, ...pending.slice(final.length)]);
        setEnrichProgress({ done: Math.min(final.length, inputRows.length), total: inputRows.length });
      } catch (e: any) {
        setError(`Chunk ${i / CHUNK + 1} failed: ${e?.message || "unknown"}`);
      }
    }
    setEnriching(false);
  }

  async function runGenerate() {
    setEnriching(true);
    setError("");
    setRows([]);
    try {
      const res = await fetch("/api/generate-targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: filterIndustry,
          role: filterRole,
          location: filterLocation,
          count: filterCount
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const targets = data.prospects || [];
      // Hand off to bulk-enrich to fetch real LinkedIn data + enrichment per target
      await runEnrichment(targets.map((t: any) => ({
        full_name: t.full_name,
        title: t.title,
        company: t.company,
        location: t.location
      })));
    } catch (e: any) {
      setError(e?.message || "generation failed");
      setEnriching(false);
    }
  }

  function toggleRow(idx: number) {
    setRows(prev => prev.map(r => r.index === idx ? { ...r, selected: !r.selected } : r));
  }

  function toggleAll() {
    const someUnselected = rows.some(r => !r.selected && r.status !== "error");
    setRows(prev => prev.map(r => r.status === "error" ? r : { ...r, selected: someUnselected }));
  }

  function importSelected() {
    const toImport = rows.filter(r => r.selected && r.status !== "error");
    toImport.forEach(r => {
      recordEnrolled(
        {
          id: "bulk-" + r.index + "-" + Date.now(),
          full_name: r.full_name,
          title: r.title || "",
          company: r.company || "",
          trust: r.source === "linkdapi" ? "verified" : "inferred"
        },
        mode === "upload" ? "CSV import" : "AI-generated target list"
      );
    });
    setRows(prev => prev.map(r => r.selected && r.status !== "error" ? { ...r, imported: true } : r));
  }

  const selectedCount = rows.filter(r => r.selected && r.status !== "error" && !r.imported).length;
  const importedCount = rows.filter(r => r.imported).length;
  const hitCount = rows.filter(r => r.status === "hit").length;
  const missCount = rows.filter(r => r.status === "miss").length;

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow tone="cyan" className="mb-2">
            {rows.length > 0
              ? `${rows.length} prospect${rows.length === 1 ? "" : "s"} · ${hitCount} verified · ${missCount} inferred`
              : "Build a list from CSV or AI"}
          </Eyebrow>
          <h1 className="serif text-[30px] leading-tight text-text">Bulk import</h1>
          <p className="text-text-3 text-[13px] mt-1">Drop a CSV of prospects, or generate a target list with AI. Each prospect is enriched with LinkedIn data + Claude inference.</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="border-b border-line flex items-center gap-1">
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 px-4 h-10 text-[13px] border-b-2 transition-colors ${
            mode === "upload"
              ? "border-cyan text-text"
              : "border-transparent text-text-3 hover:text-text-2"
          }`}
        >
          <Upload size={13} strokeWidth={1.5} />
          Upload CSV
        </button>
        <button
          onClick={() => setMode("generate")}
          className={`flex items-center gap-2 px-4 h-10 text-[13px] border-b-2 transition-colors ${
            mode === "generate"
              ? "border-cyan text-text"
              : "border-transparent text-text-3 hover:text-text-2"
          }`}
        >
          <Wand2 size={13} strokeWidth={1.5} />
          Generate with AI
          <span className="font-mono text-[9px] text-violet tracking-wider">CLAUDE</span>
        </button>
      </div>

      {/* CSV UPLOAD MODE */}
      {mode === "upload" && (
        <div>
          {csvParsed.length === 0 && (
            <section
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`bg-bg-1 border-2 border-dashed rounded-md p-12 text-center transition-colors ${
                dragOver ? "border-cyan bg-cyan/5" : "border-line"
              }`}
            >
              <FileSpreadsheet size={36} strokeWidth={1.2} className="text-text-3 mx-auto mb-4" />
              <h2 className="text-[17px] text-text font-semibold mb-2">Drop a CSV file</h2>
              <p className="text-[12px] text-text-3 mb-6 max-w-md mx-auto">
                Required column: <span className="font-mono text-text">full_name</span>. Optional: <span className="font-mono text-text-2">email, company, title, location, linkedin</span>
              </p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFileChange} className="hidden" />
              <Button variant="primary" size="md" icon={<Upload size={13} strokeWidth={2} />} onClick={() => fileRef.current?.click()}>
                Select file
              </Button>
              <div className="mt-6 pt-6 border-t border-line text-[11px] text-text-4 font-mono leading-relaxed">
                Each row will cost ≈ 2 LinkdAPI credits + 1 Claude call (≈ $0.03 per prospect)
              </div>
            </section>
          )}

          {csvParsed.length > 0 && rows.length === 0 && (
            <section className="bg-bg-1 border border-line rounded-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet size={14} strokeWidth={1.5} className="text-cyan" />
                    <span className="font-mono text-[12px] text-text">{csvFileName}</span>
                  </div>
                  <p className="text-[12px] text-text-3">{csvParsed.length} row{csvParsed.length === 1 ? "" : "s"} parsed. Ready to enrich.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" icon={<X size={11} strokeWidth={1.5} />} onClick={() => { setCsvParsed([]); setCsvFileName(""); }}>Discard</Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Sparkles size={13} strokeWidth={2} />}
                    onClick={() => runEnrichment(csvParsed)}
                    disabled={enriching}
                  >
                    Enrich {csvParsed.length} prospect{csvParsed.length === 1 ? "" : "s"}
                  </Button>
                </div>
              </div>
              {/* CSV preview */}
              <div className="border border-line rounded-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-bg-2 border-b border-line">
                  <Eyebrow className="px-3 py-2">Name</Eyebrow>
                  <Eyebrow className="px-3 py-2">Email</Eyebrow>
                  <Eyebrow className="px-3 py-2">Company</Eyebrow>
                  <Eyebrow className="px-3 py-2">Title</Eyebrow>
                </div>
                {csvParsed.slice(0, 6).map((r, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr] border-b border-line/60 last:border-b-0">
                    <div className="px-3 py-1.5 text-[12px] text-text truncate">{r.full_name || "—"}</div>
                    <div className="px-3 py-1.5 text-[11px] text-text-3 font-mono truncate">{r.email || "—"}</div>
                    <div className="px-3 py-1.5 text-[12px] text-text-2 truncate">{r.company || "—"}</div>
                    <div className="px-3 py-1.5 text-[12px] text-text-2 truncate">{r.title || "—"}</div>
                  </div>
                ))}
                {csvParsed.length > 6 && (
                  <div className="px-3 py-2 text-[11px] text-text-4 font-mono">+ {csvParsed.length - 6} more rows</div>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {/* AI GENERATE MODE */}
      {mode === "generate" && rows.length === 0 && (
        <section className="bg-bg-1 border border-line rounded-md p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-sm border border-violet/30 bg-violet/5 flex items-center justify-center shrink-0">
              <Wand2 size={16} strokeWidth={1.5} className="text-violet" />
            </div>
            <div>
              <h2 className="text-[15px] text-text font-semibold mb-1">Generate a target list with AI</h2>
              <p className="text-[12px] text-text-3 max-w-2xl">Claude will compose a plausible target list matching your filters. Each result is then enriched with real LinkedIn data via LinkdAPI where possible.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <Filter label="Industry"     value={filterIndustry}   onChange={setFilterIndustry} />
            <Filter label="Role title"   value={filterRole}       onChange={setFilterRole} />
            <Filter label="Location"     value={filterLocation}   onChange={setFilterLocation} />
            <Filter label="Count"        value={String(filterCount)} onChange={v => setFilterCount(Math.min(Math.max(parseInt(v) || 1, 1), 25))} mono />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line">
            <span className="font-mono text-[10px] text-text-4">
              ≈ {filterCount} × $0.03 = ${(filterCount * 0.03).toFixed(2)} estimated cost
            </span>
            <Button variant="primary" size="md" icon={enriching ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} strokeWidth={2} />} onClick={runGenerate} disabled={enriching}>
              {enriching ? "Generating..." : `Generate ${filterCount} target${filterCount === 1 ? "" : "s"}`}
            </Button>
          </div>
        </section>
      )}

      {error && (
        <div className="bg-bg-1 border border-rose/30 rounded-md p-3 flex items-start gap-2">
          <AlertCircle size={14} strokeWidth={1.5} className="text-rose mt-0.5 shrink-0" />
          <span className="text-[12.5px] text-text-2">{error}</span>
        </div>
      )}

      {/* RESULTS TABLE */}
      {rows.length > 0 && (
        <section>
          <SectionHeader
            eyebrow={enriching ? `Enriching ${enrichProgress.done}/${enrichProgress.total}...` : `${rows.length} prospects`}
            title="Review"
            actions={
              enriching ? (
                <div className="flex items-center gap-2 text-cyan font-mono text-[10px]">
                  <Loader2 size={11} className="animate-spin" />
                  <span>LIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={toggleAll}>
                    {rows.every(r => r.selected || r.status === "error") ? "Deselect all" : "Select all"}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Check size={13} strokeWidth={2.5} />}
                    onClick={importSelected}
                    disabled={selectedCount === 0}
                  >
                    Import {selectedCount} prospect{selectedCount === 1 ? "" : "s"}
                  </Button>
                </div>
              )
            }
          />
          <div className="bg-bg-1 border border-line rounded-md overflow-hidden">
            <div className="grid grid-cols-[36px_36px_1.4fr_1fr_1fr_120px_140px_60px] px-4 py-2 border-b border-line bg-bg-2">
              <Eyebrow>#</Eyebrow>
              <Eyebrow>✓</Eyebrow>
              <Eyebrow>Name</Eyebrow>
              <Eyebrow>Title</Eyebrow>
              <Eyebrow>Company</Eyebrow>
              <Eyebrow>Location</Eyebrow>
              <Eyebrow>Trust</Eyebrow>
              <Eyebrow>{" "}</Eyebrow>
            </div>
            {rows.map(r => (
              <div
                key={r.index}
                className={`row-in grid grid-cols-[36px_36px_1.4fr_1fr_1fr_120px_140px_60px] px-4 h-12 items-center border-b border-line/60 last:border-b-0 transition-colors ${
                  r.imported ? "bg-green/5" : r.status === "error" ? "bg-rose/5" : "hover:bg-bg-2/40"
                }`}
              >
                <span className="font-mono text-[11px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {String(r.index + 1).padStart(2, "0")}
                </span>
                <span>
                  {r.status === "pending" ? (
                    <Loader2 size={11} className="animate-spin text-text-4" />
                  ) : r.imported ? (
                    <Check size={12} strokeWidth={2.5} className="text-green" />
                  ) : r.status === "error" ? (
                    <X size={12} strokeWidth={2} className="text-rose" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={r.selected}
                      onChange={() => toggleRow(r.index)}
                      className="w-3.5 h-3.5 accent-cyan cursor-pointer"
                    />
                  )}
                </span>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={r.full_name} size={24} />
                  <div className="min-w-0">
                    <div className="text-[12px] text-text truncate">{r.full_name}</div>
                    <div className="font-mono text-[10px] text-text-4 truncate">{r.email || "—"}</div>
                  </div>
                </div>
                <span className="text-[12px] text-text-2 truncate">{r.title || "—"}</span>
                <span className="text-[12px] text-text-2 truncate">{r.company || "—"}</span>
                <span className="font-mono text-[11px] text-text-3 truncate" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {r.location || "—"}
                </span>
                <span>
                  {r.status === "pending" ? (
                    <span className="font-mono text-[10px] text-text-4">working...</span>
                  ) : (
                    <TrustBadge tier={r.source === "linkdapi" ? "verified" : "inferred"} source={r.source === "linkdapi" ? "LinkdAPI" : "Claude"} />
                  )}
                </span>
                <span>
                  {r.linkedin_url && (
                    <a href={r.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-text-3 hover:text-cyan">
                      <Linkedin size={13} strokeWidth={1.5} />
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Post-import banner */}
          {importedCount > 0 && (
            <div className="row-in mt-4 bg-bg-1 border border-green/30 rounded-md p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-green/10 border border-green/30 flex items-center justify-center shrink-0">
                <Check size={16} strokeWidth={2.5} className="text-green" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] text-text font-medium">
                  {importedCount} prospect{importedCount === 1 ? "" : "s"} imported to your workspace
                </div>
                <div className="text-[12px] text-text-3">They've been added to your activity feed. Open Leads to enroll them in a sequence.</div>
              </div>
              <Link href="/leads">
                <Button variant="secondary" size="sm" icon={<ArrowRight size={11} strokeWidth={1.5} />}>
                  Open Leads
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Footer hint */}
      {rows.length === 0 && (
        <div className="bg-bg-1 border border-line rounded-md p-4 flex items-start gap-3">
          <FileText size={14} strokeWidth={1.5} className="text-text-3 mt-0.5 shrink-0" />
          <div className="text-[12px] text-text-3 leading-relaxed">
            <span className="text-text">Tip:</span> Both modes feed the same review table below. Each row is enriched with LinkdAPI (real LinkedIn data when slug matches) and Claude (company facts, why-hot signals). Inferred fields are clearly labeled.
          </div>
        </div>
      )}
    </div>
  );
}

function Filter({ label, value, onChange, mono = false }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; }) {
  return (
    <div>
      <Eyebrow className="mb-1.5">{label}</Eyebrow>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full h-9 bg-bg-2 border border-line rounded-sm px-3 text-[12px] text-text focus:border-cyan ${mono ? "font-mono" : ""}`}
        style={mono ? { fontVariantNumeric: "tabular-nums" } : undefined}
      />
    </div>
  );
}
