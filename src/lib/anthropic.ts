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

// === DOSSIER ENRICHMENT (everything in one call) ===
// Used for auto-fill on dossier load. Returns company facts + "why hot" signals
// in a single API call. Cached client-side per-prospect.

const ENRICH_SYSTEM = `\
You are a B2B sales intelligence analyst enriching a recruiter dossier.

The prospect's LinkedIn profile gave us their name, title, and current company. We need you to INFER plausible company facts and identify why this prospect is "hot" right now for Paraform sales outreach.

Output strict JSON, no markdown:
{
  "company": {
    "industry": "Specific industry (e.g. 'Health Tech', 'Developer Tools', 'Fintech') — pick the most likely one",
    "size": "Headcount range (e.g. '50-200', '500-1000', '1000+')",
    "stage": "Funding stage if growth-stage SaaS (e.g. 'Series B', 'Series C', 'Public') OR 'Bootstrapped' OR 'Established' if mature",
    "headquarters": "City, State (US) or City, Country",
    "founded": "Year as string (estimated), or '—' if truly unknown",
    "summary": "One sentence (12-18 words) on what the company does and where they are in their journey"
  },
  "why_hot": [
    "First signal — 8-14 words, specific. E.g. 'Just opened 5 engineering reqs in 2 weeks — backlog growing'",
    "Second signal — 8-14 words, complementary angle",
    "Third signal — 8-14 words, focused on urgency or capacity"
  ],
  "pain_points": [
    "Pain statement 1 — 8-14 words, specific to their role and stage",
    "Pain statement 2 — 8-14 words, complementary",
    "Pain statement 3 — 8-14 words, focused on capacity or time-to-hire"
  ],
  "why_now": "One sentence (15-25 words) on why THIS WEEK is the right time to reach out",
  "angle": "One sentence (10-15 words) on what hook to lead with",
  "email": {
    "subject": "4-8 word subject line",
    "body": "60-100 word cold email body, signed 'Mike' on its own line. References specific hiring signal. Mentions 21-day fill rate. One clear CTA for 20-min call."
  },
  "brief": {
    "headline": "One line, 8-12 words, the most important thing about this prospect",
    "company_summary": "2 sentences on what the company does + hiring trajectory",
    "person_summary": "2 sentences on the person — likely tenure, scope, what they care about",
    "talking_points": ["Point 1 (12-18 words)", "Point 2", "Point 3"],
    "objections": ["Objection + rebuttal (1 sentence each)", "Second objection + rebuttal"],
    "ideal_outcome": "One sentence on what success looks like for the discovery call"
  }
}

Be specific. Make reasonable inferences from name + title + company. If the company is small/solo (e.g. a consultancy), reflect that honestly in size/stage.
For Mike's cold email tone: direct, peer-to-peer, no fluff, no exclamation marks, no "hope this finds you well."
`;

export interface EnrichedDossier {
  company: {
    industry: string;
    size: string;
    stage: string;
    headquarters: string;
    founded: string;
    summary: string;
  };
  why_hot: string[];
  pain_points: string[];
  why_now: string;
  angle: string;
  email: { subject: string; body: string; };
  brief: {
    headline: string;
    company_summary: string;
    person_summary: string;
    talking_points: string[];
    objections: string[];
    ideal_outcome: string;
  };
}

export async function enrichDossier(p: ProspectContext): Promise<EnrichedDossier> {
  const userPrompt = `\
${PARAFORM_CONTEXT}

PROSPECT:
- Name: ${p.full_name} (first name: ${p.first_name})
- Title: ${p.title}
- Company: ${p.company}
- Industry hint: ${p.company_industry || "unknown — infer"}
- Size hint: ${p.company_size || "unknown — infer"}
- Location: ${p.location || "unknown"}
- About: ${p.about || "no about text — infer from title/company"}
- Hiring signals: ${(p.hiring_signals || []).join("; ") || "none flagged"}

Enrich this dossier with company facts, why-hot signals, pain points, a cold email, and a 1-page prep brief. Return JSON only.`;

  return callClaude(ENRICH_SYSTEM, userPrompt, 2000);
}
