import { NextResponse } from "next/server";
import { generatePrepBrief } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const ctx = await req.json();
    const result = await generatePrepBrief(ctx);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("prep-brief error:", e);
    return NextResponse.json({ error: e.message || "failed" }, { status: 500 });
  }
}
