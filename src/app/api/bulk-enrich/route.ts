import { NextResponse } from "next/server";
import { getProfileByUsername, searchByName, extractLinkedInSlug } from "@/lib/linkdapi";
import { enrichDossier, type ProspectContext } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Bulk enrichment endpoint. Takes a list of raw prospect entries (free-text names,
 * LinkedIn URLs, or pre-parsed CSV rows) and returns enriched profiles.
 *
 * Strategy: parallel processing with a concurrency cap to avoid hammering
 * LinkdAPI rate limits. Each row:
 *   1. Try LinkdAPI (URL → exact match; name → multi-slug attempts)
 *   2. If LinkdAPI hits → use real data; if miss → fallback to row-provided fields
 *   3. Enrich with Claude (company facts, signals, pain, email) — same as dossier auto-fill
 *
 * Returns one object per input row, even if some fail individually.
 */

interface InputRow {
  // Either a parsed CSV row OR free-text query (LinkedIn URL or name)
  query?: string;
  full_name?: string;
  email?: string;
  company?: string;
  title?: string;
  location?: string;
}

interface OutputRow {
  index: number;
  status: "hit" | "miss" | "error";
  source: "linkdapi" | "csv" | "ai_generated";
  full_name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company?: string;
  email?: string;
  location?: string;
  linkedin_url?: string;
  about?: string;
  industry?: string;
  size?: string;
  stage?: string;
  // Enrichment data (the same shape as /api/enrich-dossier)
  why_hot?: string[];
  pain_points?: string[];
  error?: string;
}

const CONCURRENCY = 3; // process 3 prospects in parallel

async function processOne(row: InputRow, index: number): Promise<OutputRow> {
  try {
    // 1. Resolve via LinkdAPI if we have a usable signal
    let profile = null;
    const rawQuery = row.query || row.full_name || "";
    if (rawQuery) {
      const slug = extractLinkedInSlug(rawQuery);
      if (slug) {
        profile = await getProfileByUsername(slug);
      } else {
        profile = await searchByName(rawQuery);
      }
    }

    // 2. Build the base prospect record — prefer LinkdAPI, fall back to CSV row
    const full_name = profile?.full_name || row.full_name || rawQuery || "Unknown";
    const first_name = profile?.first_name || full_name.split(" ")[0] || "";
    const last_name = profile?.last_name || full_name.split(" ").slice(1).join(" ") || "";
    const title = profile?.title || row.title || "";
    const company = profile?.company || row.company || "";
    const location = profile?.location || row.location || "";

    const status: OutputRow["status"] = profile ? "hit" : (row.full_name || row.company ? "miss" : "error");
    const source: OutputRow["source"] = profile ? "linkdapi" : (row.full_name ? "csv" : "ai_generated");

    // 3. Enrich with Claude — runs even if LinkdAPI missed, because we can still
    //    infer company facts from the name/title/company hints in the CSV
    let enrichment = null;
    if (full_name && full_name !== "Unknown") {
      try {
        const ctx: ProspectContext = {
          full_name,
          first_name,
          title: title || "Talent leader",
          company: company || "Unknown",
          company_industry: undefined,
          company_size: undefined,
          location,
          about: profile?.about || ""
        };
        enrichment = await enrichDossier(ctx);
      } catch (e) {
        // Enrichment failure is non-fatal — return what we have
        console.error("Bulk enrichment failed for row", index, e);
      }
    }

    return {
      index,
      status,
      source,
      full_name,
      first_name,
      last_name,
      title,
      company,
      email: row.email || profile?.linkedin_url ? `${first_name.toLowerCase()}.${last_name.toLowerCase()}@${(company || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com` : "",
      location,
      linkedin_url: profile?.linkedin_url,
      about: profile?.about,
      industry: enrichment?.company?.industry,
      size: enrichment?.company?.size,
      stage: enrichment?.company?.stage,
      why_hot: enrichment?.why_hot,
      pain_points: enrichment?.pain_points
    };
  } catch (e: any) {
    return {
      index,
      status: "error",
      source: "csv",
      full_name: row.full_name || row.query || "Unknown",
      error: e?.message || "processing failed"
    };
  }
}

async function processBatch(rows: InputRow[]): Promise<OutputRow[]> {
  const results: OutputRow[] = new Array(rows.length);
  let cursor = 0;
  async function worker() {
    while (cursor < rows.length) {
      const i = cursor++;
      results[i] = await processOne(rows[i], i);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rows: InputRow[] = Array.isArray(body?.rows) ? body.rows : [];
    if (rows.length === 0) {
      return NextResponse.json({ error: "no rows provided" }, { status: 400 });
    }
    if (rows.length > 30) {
      return NextResponse.json({ error: "max 30 rows per request" }, { status: 400 });
    }
    const results = await processBatch(rows);
    return NextResponse.json({ results });
  } catch (e: any) {
    console.error("bulk-enrich error:", e);
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
