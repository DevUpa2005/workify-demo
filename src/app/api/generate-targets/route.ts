import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const GENERATE_SYSTEM = `\
You are a B2B sales intelligence analyst generating a TARGET LIST of plausible prospects matching specific filter criteria.

Your output is a list of REALISTIC but FICTIONAL prospects who would plausibly match the filters. These are hypothetical targets — they don't need to be real people. The names should sound diverse and realistic.

Output strict JSON, no markdown:
{
  "prospects": [
    {
      "full_name": "First Last",
      "title": "Specific role title matching the filter",
      "company": "Realistic-sounding company name that matches industry + size",
      "linkedin_slug": "first-last-XXXX (suggested LinkedIn handle)",
      "location": "City, State or City, Country matching the location filter"
    }
  ]
}

Rules:
- Generate the EXACT count requested
- Vary names by ethnicity and gender
- Company names should sound real but be fictional (Avoid: Google, Stripe, Anthropic, OpenAI, Notion, etc.)
- Titles must match the role filter
- Locations must match the location filter
- Companies must match the industry + size filters
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { industry, role, location, count } = body;
    const n = Math.min(Math.max(parseInt(count) || 10, 1), 25);

    const userPrompt = `\
FILTERS:
- Industry: ${industry || "any B2B SaaS"}
- Role: ${role || "Head of Talent / VP People / Talent Director"}
- Location: ${location || "United States"}
- Count: ${n}

Generate ${n} plausible target prospects matching these filters. Return JSON only.`;

    const msg = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2500,
      system: GENERATE_SYSTEM,
      messages: [{ role: "user", content: userPrompt }]
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("\n")
      .trim();
    const clean = text.replace(/```json\s*|```\s*/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("generate-targets error:", e);
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
