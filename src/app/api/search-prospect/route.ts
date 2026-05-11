import { NextResponse } from "next/server";
import { getProfileByUsername, searchByName, extractLinkedInSlug } from "@/lib/linkdapi";

export const runtime = "nodejs";
export const maxDuration = 25;

/**
 * Honest API:
 *  - If LinkdAPI returns a real profile → status "hit"
 *  - If nothing was found after exhaustive attempts → status "miss"
 *  - On error → status "error"
 *
 * Notes:
 *  - No fabricated/inferred profiles. The product must never return invented data.
 *  - URL extraction is regex-tolerant: handles bare linkedin.com/in/xxx without https://
 */
export async function POST(req: Request) {
  let query = "";
  try {
    const body = await req.json();
    query = (body?.query || "").toString().trim();
    if (!query) {
      return NextResponse.json({ status: "miss", profile: null, reason: "empty_query" });
    }

    // 1. Detect a LinkedIn slug anywhere in the input — with or without protocol.
    const slug = extractLinkedInSlug(query);
    if (slug) {
      const profile = await getProfileByUsername(slug);
      if (profile) {
        return NextResponse.json({ status: "hit", profile, source: "linkdapi", method: "url" });
      }
      return NextResponse.json({
        status: "miss",
        profile: null,
        reason: "url_not_found",
        attempted_slug: slug
      });
    }

    // 2. Treat as a free-text name search. Try multiple slug variations.
    const profile = await searchByName(query);
    if (profile) {
      return NextResponse.json({ status: "hit", profile, source: "linkdapi", method: "name" });
    }

    return NextResponse.json({
      status: "miss",
      profile: null,
      reason: "name_not_found"
    });
  } catch (e: any) {
    console.error("search-prospect error:", e);
    return NextResponse.json({
      status: "error",
      profile: null,
      error: e?.message || "unknown_error"
    }, { status: 500 });
  }
}
