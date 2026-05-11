import { NextResponse } from "next/server";
import { enrichDossier, type ProspectContext } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ProspectContext;
    if (!body?.full_name) {
      return NextResponse.json({ error: "missing prospect" }, { status: 400 });
    }
    const result = await enrichDossier(body);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("enrich-dossier error:", e);
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
