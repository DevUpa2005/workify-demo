import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const MODEL = "claude-sonnet-4-5";

// === PARAFORM PITCH CONTEXT ===
// Used in all AI prompts so generated content always pitches Paraform correctly.
const PARAFORM_CONTEXT = `\
Paraform is an AI-powered recruitment platform sold to companies that need to hire.
Key differentiator: a 21-day average fill rate (vs. industry average of 60+ days).
Sells to HR / Talent / People leaders at growth-stage companies that are actively hiring.
The ideal next step from any outreach is to book a 20-minute discovery call.
`;

// === COLD EMAIL SYSTEM PROMPT ===
const EMAIL_SYSTEM = `\
You are a senior B2B copywriter writing a cold email from Mike at Paraform to a Head of Talent / HR leader.

Voice: Direct, human, peer-to-peer. Sounds like an internal email, not marketing.

HARD RULES:
- Subject: 4–8 words. References the recipient's company OR a specific role they're hiring for.
- Body: 60–100 words. No fluff. No "hope this finds you well."
- Opens with a SPECIFIC reference to a recent job they posted OR a hiring signal.
- Mentions Paraform's 21-day fill rate as a concrete, calibrated stat (not a brag).
- ONE clear CTA: a 20-min call. Suggest yes/no reply or a specific time window.
- Signs off with just "Mike" on its own line.
- No emojis. No superlatives ("amazing", "game-changing"). No exclamation marks.

Return ONLY a JSON object, no preamble, no markdown fences:
{"subject": "...", "body": "..."}
`;

// === PAIN INFERENCE SYSTEM PROMPT ===
const PAIN_SYSTEM = `\
You are a B2B sales analyst inferring likely pain points for a hiring leader based on signals from their LinkedIn profile and company data.

Output exactly 3 bullets, each 8–14 words, written as PAIN STATEMENTS (not generic observations).

Example output format:
{
  "pain_points": [
    "Engineering hiring backlog growing as Series B headcount targets accelerate",
    "Recruiter capacity strained — single TA lead supporting 12 open roles",
    "Manual sourcing burning cycles that should go to candidate experience"
  ],
  "why_now": "One sentence (15–25 words) on why this specific person is worth reaching out to THIS WEEK.",
  "angle": "One sentence (10–15 words) on what hook to lead with."
}

Return ONLY the JSON object. No preamble. No markdown fences.
`;

// === PREP BRIEF SYSTEM PROMPT ===
const PREP_SYSTEM = `\
You are preparing a 1-page intel brief for Mike at Paraform before a discovery call.

Output JSON with these keys:
- "headline": One line, 8–12 words, captures the most important thing about this prospect.
- "company_summary": 2 sentences on what the company does + their hiring trajectory.
- "person_summary": 2 sentences on the person — tenure, scope, what they likely care about.
- "talking_points": Array of 3 strings, each 12–18 words. Things Mike should bring up.
- "objections": Array of 2 strings. Likely objections and 1-sentence rebuttals each.
- "ideal_outcome": One sentence on what success looks like for this call.

Return ONLY the JSON object. No preamble. No markdown fences.
`;

// === HELPERS ===

async function callClaude(systemPrompt: string, userPrompt: string, maxTokens = 800) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }]
  });

  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  const clean = text.replace(/```json\s*|```\s*/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error("Claude response not valid JSON:", clean);
    throw new Error("AI response parse error");
  }
}

// === PUBLIC API ===

export interface ProspectContext {
  full_name: string;
  first_name: string;
  title: string;
  company: string;
  company_industry?: string;
  company_size?: string;
  recent_job_posting?: string;
  location?: string;
  about?: string;
  hiring_signals?: string[];
}

export async function generateEmail(p: ProspectContext): Promise<{ subject: string; body: string; }> {
  const userPrompt = `\
${PARAFORM_CONTEXT}

PROSPECT:
- Name: ${p.full_name} (first name: ${p.first_name})
- Title: ${p.title}
- Company: ${p.company}
- Industry: ${p.company_industry || "unknown"}
- Size: ${p.company_size || "unknown"}
- Location: ${p.location || "unknown"}
- Recent job posting: ${p.recent_job_posting || "unknown"}
- Hiring signals: ${(p.hiring_signals || []).join("; ") || "none flagged"}

Write the cold email now. Return JSON only.`;

  return callClaude(EMAIL_SYSTEM, userPrompt, 600);
}

export async function inferPain(p: ProspectContext): Promise<{
  pain_points: string[];
  why_now: string;
  angle: string;
}> {
  const userPrompt = `\
PROSPECT:
- Name: ${p.full_name}
- Title: ${p.title}
- Company: ${p.company}
- Industry: ${p.company_industry || "unknown"}
- Size: ${p.company_size || "unknown"}
- Recent job posting: ${p.recent_job_posting || "unknown"}
- Hiring signals: ${(p.hiring_signals || []).join("; ") || "none flagged"}
- About: ${p.about || "no about text"}

Infer 3 specific pain points, why now, and the best angle. Return JSON only.`;

  return callClaude(PAIN_SYSTEM, userPrompt, 500);
}

export async function generatePrepBrief(p: ProspectContext): Promise<{
  headline: string;
  company_summary: string;
  person_summary: string;
  talking_points: string[];
  objections: string[];
  ideal_outcome: string;
}> {
  const userPrompt = `\
${PARAFORM_CONTEXT}

PROSPECT:
- Name: ${p.full_name}
- Title: ${p.title}
- Company: ${p.company}
- Industry: ${p.company_industry || "unknown"}
- Size: ${p.company_size || "unknown"}
- About: ${p.about || "no about text"}
- Hiring signals: ${(p.hiring_signals || []).join("; ") || "none flagged"}

Generate the prep brief. Return JSON only.`;

  return callClaude(PREP_SYSTEM, userPrompt, 900);
}
