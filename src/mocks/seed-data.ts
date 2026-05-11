import type { Recruiter, Company, PipelineStage } from "@/lib/types";

// 15 pre-seeded HR/Talent leaders at fictional-but-realistic Series B-D SaaS companies.
// Names are intentionally generic so they don't collide with real people Mike might know.
// Companies are fictional with realistic names/industries.

export const COMPANIES: Company[] = [
  {
    id: "c1",
    legal_name: "Lattice Forge, Inc.",
    domain: "latticeforge.com",
    trust: "verified",
    hq_location: "San Francisco, CA",
    industry: "Developer Tools / Infrastructure",
    size: "180-220",
    funding_stage: "Series C",
    funding_total: "$84M",
    founded: 2019,
    description: "Build pipeline platform for distributed engineering teams.",
    signals: [
      { label: "Recently raised", value: "Series C — $42M lead by Accel", source: "inferred", trust: "likely" },
      { label: "Open roles", value: "14 active (8 eng, 3 GTM, 3 ops)", source: "linkedin", trust: "verified" }
    ],
    hiring_signals: [
      { role: "Senior Platform Engineer", posted: "3 days ago" },
      { role: "Engineering Manager, Distributed Systems", posted: "1 week ago" },
      { role: "Staff Site Reliability Engineer", posted: "1 week ago" }
    ],
    recent_news: [
      { headline: "Lattice Forge raises $42M Series C to expand platform team", date: "12 days ago", source: "TechCrunch" }
    ]
  },
  {
    id: "c2",
    legal_name: "Northwind Analytics Co.",
    domain: "northwindco.io",
    trust: "verified",
    hq_location: "New York, NY",
    industry: "Data / Analytics",
    size: "90-110",
    funding_stage: "Series B",
    funding_total: "$31M",
    founded: 2020,
    description: "Embedded analytics for B2B SaaS companies.",
    signals: [
      { label: "Hiring velocity", value: "+8 headcount last 30 days", source: "linkedin", trust: "verified" },
      { label: "Recent news", value: "Launched Snowflake-native product Apr 2026", source: "inferred", trust: "likely" }
    ],
    hiring_signals: [
      { role: "Head of Customer Engineering", posted: "5 days ago" },
      { role: "Senior Data Scientist", posted: "2 weeks ago" }
    ]
  },
  {
    id: "c3",
    legal_name: "Pelican Labs",
    domain: "pelicanlabs.ai",
    trust: "verified",
    hq_location: "Remote (US)",
    industry: "AI / ML Platform",
    size: "45-60",
    funding_stage: "Series B",
    funding_total: "$28M",
    founded: 2021,
    description: "MLOps platform for production ML teams.",
    signals: [
      { label: "Funding momentum", value: "Series B closed 6 weeks ago", source: "inferred", trust: "likely" },
      { label: "Job posts", value: "9 open roles, all senior+", source: "linkedin", trust: "verified" }
    ],
    hiring_signals: [
      { role: "Principal ML Engineer", posted: "2 days ago" },
      { role: "Director of Engineering", posted: "9 days ago" }
    ]
  },
  {
    id: "c4",
    legal_name: "Cobalt Stream Technologies",
    domain: "cobaltstream.com",
    trust: "verified",
    hq_location: "Austin, TX",
    industry: "Fintech / Payments",
    size: "250-300",
    funding_stage: "Series D",
    funding_total: "$140M",
    founded: 2017,
    signals: [
      { label: "Late-stage scale", value: "Pre-IPO band, hiring across functions", source: "inferred", trust: "likely" }
    ],
    hiring_signals: [
      { role: "VP of Engineering", posted: "1 day ago" },
      { role: "Head of Risk", posted: "4 days ago" }
    ]
  },
  {
    id: "c5",
    legal_name: "Verbena Health",
    domain: "verbenahealth.com",
    trust: "verified",
    hq_location: "Boston, MA",
    industry: "Healthcare SaaS",
    size: "120-150",
    funding_stage: "Series C",
    funding_total: "$60M",
    founded: 2018,
    signals: [
      { label: "Compliance scope", value: "HIPAA / SOC 2 — long hiring cycles flagged", source: "inferred", trust: "inferred" }
    ],
    hiring_signals: [
      { role: "Senior Backend Engineer (HIPAA)", posted: "6 days ago" }
    ]
  },
  {
    id: "c6",
    legal_name: "Quartzline Software",
    domain: "quartzline.io",
    trust: "verified",
    hq_location: "Seattle, WA",
    industry: "DevSecOps",
    size: "70-90",
    funding_stage: "Series B",
    funding_total: "$24M",
    founded: 2020,
    hiring_signals: [
      { role: "Security Engineer", posted: "8 days ago" },
      { role: "Senior Full-Stack Engineer", posted: "10 days ago" }
    ],
    signals: []
  },
  {
    id: "c7",
    legal_name: "Maridian Robotics",
    domain: "maridian.co",
    trust: "verified",
    hq_location: "Pittsburgh, PA",
    industry: "Industrial Robotics",
    size: "160-200",
    funding_stage: "Series C",
    funding_total: "$72M",
    founded: 2018,
    hiring_signals: [
      { role: "Robotics Software Lead", posted: "3 days ago" }
    ],
    signals: []
  },
  {
    id: "c8",
    legal_name: "Halcyon Cloud, Inc.",
    domain: "halcyoncloud.com",
    trust: "verified",
    hq_location: "Denver, CO",
    industry: "Cloud Infrastructure",
    size: "110-140",
    funding_stage: "Series B",
    funding_total: "$36M",
    founded: 2019,
    hiring_signals: [
      { role: "Engineering Manager, Platform", posted: "1 week ago" }
    ],
    signals: []
  }
];

export const RECRUITERS: Recruiter[] = [
  {
    id: "r1",
    company_id: "c1",
    full_name: "Sarah Reyes",
    first_name: "Sarah",
    last_name: "Reyes",
    title: "Head of Talent",
    email: "sarah.reyes@latticeforge.com",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "researching",
    linkedin_url: "https://linkedin.com/in/sarah-reyes-talent",
    location: "San Francisco, CA",
    headline: "Building hiring engines for series B/C engineering teams",
    about: "Eight years scaling TA at Series B-D companies. Currently leading talent at Lattice Forge through Series C scale.",
    experience: [
      { title: "Head of Talent", company: "Lattice Forge", duration: "2y 3m" },
      { title: "Senior Recruiter", company: "Datadog", duration: "3y 1m" }
    ],
    education: [{ school: "UC Berkeley", degree: "B.A. Cognitive Science" }],
    signals: [
      { label: "Tenure", value: "2 yrs at Lattice Forge", source: "linkedin", trust: "verified" },
      { label: "Hiring load", value: "8 eng roles open", source: "inferred", trust: "likely" }
    ],
    last_touch_at: "2026-05-08T15:22:00Z",
    value_usd: 18000
  },
  {
    id: "r2",
    company_id: "c2",
    full_name: "Daniel Okafor",
    first_name: "Daniel",
    last_name: "Okafor",
    title: "Director of Talent Acquisition",
    email: "dokafor@northwindco.io",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "sequenced",
    location: "New York, NY",
    headline: "TA leader • Scaled 3 startups from 50 to 300+",
    about: "Specialist in early-to-mid stage TA. Built and ran talent functions at three Series B companies.",
    experience: [
      { title: "Director of TA", company: "Northwind Analytics Co.", duration: "1y 4m" },
      { title: "Head of People", company: "Tessera AI", duration: "2y" }
    ],
    education: [{ school: "NYU Stern", degree: "BS Management" }],
    signals: [
      { label: "Recent hiring", value: "8 hires in last 30 days", source: "linkedin", trust: "verified" }
    ],
    last_touch_at: "2026-05-09T09:11:00Z",
    value_usd: 24000
  },
  {
    id: "r3",
    company_id: "c3",
    full_name: "Priya Iyer",
    first_name: "Priya",
    last_name: "Iyer",
    title: "Head of People",
    email: "priya@pelicanlabs.ai",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "new",
    location: "Remote (US)",
    headline: "People & Talent @ Pelican Labs",
    about: "Building the people function at Pelican Labs. Hiring ML engineers, designers, and GTM leaders.",
    experience: [
      { title: "Head of People", company: "Pelican Labs", duration: "11m" }
    ],
    education: [{ school: "Stanford", degree: "MS Org Behavior" }],
    signals: [
      { label: "Solo TA", value: "Only TA hire — capacity-constrained", source: "inferred", trust: "inferred" }
    ],
    last_touch_at: undefined,
    value_usd: 12000
  },
  {
    id: "r4",
    company_id: "c4",
    full_name: "James Liu",
    first_name: "James",
    last_name: "Liu",
    title: "VP of People",
    email: "jliu@cobaltstream.com",
    email_status: "likely",
    trust: "likely",
    pipeline_stage: "replied",
    location: "Austin, TX",
    headline: "VP People @ Cobalt Stream • Fintech scale operator",
    about: "Scaling Cobalt Stream's people function through Series D and into pre-IPO. Previously at Stripe and Plaid.",
    experience: [
      { title: "VP People", company: "Cobalt Stream", duration: "1y 8m" },
      { title: "Director of People Ops", company: "Plaid", duration: "3y 2m" }
    ],
    education: [{ school: "Wharton", degree: "MBA" }],
    signals: [
      { label: "Pre-IPO hiring", value: "Replacement + growth hires accelerating", source: "inferred", trust: "likely" }
    ],
    last_touch_at: "2026-05-09T18:42:00Z",
    value_usd: 45000
  },
  {
    id: "r5",
    company_id: "c5",
    full_name: "Megan Caldwell",
    first_name: "Megan",
    last_name: "Caldwell",
    title: "Senior Recruiter",
    email: "mcaldwell@verbenahealth.com",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "meeting",
    location: "Boston, MA",
    headline: "Healthcare tech recruiting • HIPAA-aware",
    about: "Senior recruiter at Verbena Health focused on engineering and clinical product roles.",
    experience: [
      { title: "Senior Recruiter", company: "Verbena Health", duration: "2y 1m" }
    ],
    education: [{ school: "Boston College" }],
    signals: [
      { label: "Cycle time", value: "Compliance hiring runs 90+ days", source: "inferred", trust: "likely" }
    ],
    last_touch_at: "2026-05-10T13:00:00Z",
    value_usd: 28000
  },
  {
    id: "r6",
    company_id: "c6",
    full_name: "Marcus Hale",
    first_name: "Marcus",
    last_name: "Hale",
    title: "Head of Talent",
    email: "marcus@quartzline.io",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "sequenced",
    location: "Seattle, WA",
    headline: "Talent @ Quartzline • Security engineering recruiting",
    about: "Talent lead at Quartzline. Specialty: hiring scarce security and infra engineers.",
    experience: [
      { title: "Head of Talent", company: "Quartzline", duration: "1y 6m" }
    ],
    education: [{ school: "University of Washington" }],
    signals: [
      { label: "Niche talent", value: "Security engineering — 4-month median time-to-fill", source: "inferred", trust: "likely" }
    ],
    last_touch_at: "2026-05-07T10:30:00Z",
    value_usd: 22000
  },
  {
    id: "r7",
    company_id: "c7",
    full_name: "Adaeze Nwosu",
    first_name: "Adaeze",
    last_name: "Nwosu",
    title: "Director of People Operations",
    email: "anwosu@maridian.co",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "new",
    location: "Pittsburgh, PA",
    headline: "People Ops @ Maridian Robotics",
    about: "Director of People Ops at Maridian. Building the people function in industrial robotics.",
    experience: [{ title: "Director of People Ops", company: "Maridian Robotics", duration: "2y" }],
    education: [{ school: "Carnegie Mellon" }],
    signals: [
      { label: "Specialty hiring", value: "Robotics software talent — hard to source", source: "inferred", trust: "likely" }
    ],
    value_usd: 32000
  },
  {
    id: "r8",
    company_id: "c8",
    full_name: "Tom Bergstrom",
    first_name: "Tom",
    last_name: "Bergstrom",
    title: "Talent Partner",
    email: "tom.b@halcyoncloud.com",
    email_status: "likely",
    trust: "likely",
    pipeline_stage: "researching",
    location: "Denver, CO",
    headline: "Talent @ Halcyon Cloud",
    about: "Engineering recruiter at Halcyon Cloud.",
    experience: [{ title: "Talent Partner", company: "Halcyon Cloud", duration: "1y 2m" }],
    education: [{ school: "CU Boulder" }],
    signals: [],
    last_touch_at: "2026-05-09T16:15:00Z",
    value_usd: 14000
  },
  {
    id: "r9",
    company_id: "c1",
    full_name: "Yuki Tanaka",
    first_name: "Yuki",
    last_name: "Tanaka",
    title: "Senior Technical Recruiter",
    email: "yuki@latticeforge.com",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "won",
    location: "San Francisco, CA",
    headline: "Sr. Tech Recruiter @ Lattice Forge",
    about: "Technical recruiter at Lattice Forge. Engineering and platform.",
    experience: [{ title: "Sr. Tech Recruiter", company: "Lattice Forge", duration: "2y 7m" }],
    education: [{ school: "UCLA" }],
    signals: [
      { label: "Won Apr 2026", value: "Closed annual contract — $42k", source: "inferred", trust: "verified" }
    ],
    last_touch_at: "2026-04-22T11:00:00Z",
    value_usd: 42000
  },
  {
    id: "r10",
    company_id: "c2",
    full_name: "Rachel Mendoza",
    first_name: "Rachel",
    last_name: "Mendoza",
    title: "Recruiting Lead, GTM",
    email: "rachel@northwindco.io",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "replied",
    location: "New York, NY",
    headline: "GTM Recruiting @ Northwind",
    about: "GTM recruiting lead. Sales, marketing, customer success hires.",
    experience: [{ title: "GTM Recruiting Lead", company: "Northwind", duration: "1y" }],
    education: [{ school: "Cornell" }],
    signals: [],
    last_touch_at: "2026-05-10T07:45:00Z",
    value_usd: 19000
  },
  {
    id: "r11",
    company_id: "c3",
    full_name: "Hassan Khalil",
    first_name: "Hassan",
    last_name: "Khalil",
    title: "Head of Engineering Recruiting",
    email: "hassan@pelicanlabs.ai",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "meeting",
    location: "Toronto, ON",
    headline: "Eng Recruiting @ Pelican Labs",
    about: "Engineering recruiting lead at Pelican. ML/infra/platform.",
    experience: [{ title: "Head of Eng Recruiting", company: "Pelican Labs", duration: "8m" }],
    education: [{ school: "University of Waterloo" }],
    signals: [],
    last_touch_at: "2026-05-10T14:30:00Z",
    value_usd: 26000
  },
  {
    id: "r12",
    company_id: "c4",
    full_name: "Olivia Park",
    first_name: "Olivia",
    last_name: "Park",
    title: "Senior People Partner",
    email: "olivia.park@cobaltstream.com",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "new",
    location: "Austin, TX",
    headline: "People Partner @ Cobalt Stream",
    about: "People business partner. Engineering org.",
    experience: [{ title: "Senior People Partner", company: "Cobalt Stream", duration: "2y 4m" }],
    education: [{ school: "UT Austin" }],
    signals: [],
    value_usd: 16000
  },
  {
    id: "r13",
    company_id: "c5",
    full_name: "David Eriksen",
    first_name: "David",
    last_name: "Eriksen",
    title: "Talent Acquisition Manager",
    email: "deriksen@verbenahealth.com",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "researching",
    location: "Boston, MA",
    headline: "TA @ Verbena Health",
    about: "Talent Acquisition Manager focused on engineering and clinical product.",
    experience: [{ title: "TA Manager", company: "Verbena Health", duration: "1y 5m" }],
    education: [{ school: "Boston University" }],
    signals: [],
    last_touch_at: "2026-05-08T11:20:00Z",
    value_usd: 17000
  },
  {
    id: "r14",
    company_id: "c7",
    full_name: "Claire Beaumont",
    first_name: "Claire",
    last_name: "Beaumont",
    title: "Senior Technical Recruiter",
    email: "claire@maridian.co",
    email_status: "likely",
    trust: "likely",
    pipeline_stage: "sequenced",
    location: "Boston, MA",
    headline: "Sr. Tech Recruiter @ Maridian",
    about: "Senior technical recruiter at Maridian Robotics.",
    experience: [{ title: "Sr. Technical Recruiter", company: "Maridian", duration: "11m" }],
    education: [{ school: "Northeastern" }],
    signals: [],
    last_touch_at: "2026-05-07T09:00:00Z",
    value_usd: 13000
  },
  {
    id: "r15",
    company_id: "c8",
    full_name: "Aiden Wright",
    first_name: "Aiden",
    last_name: "Wright",
    title: "Head of Talent",
    email: "aiden@halcyoncloud.com",
    email_status: "verified",
    trust: "verified",
    pipeline_stage: "replied",
    location: "Denver, CO",
    headline: "Head of Talent @ Halcyon Cloud",
    about: "Head of Talent at Halcyon. Engineering-heavy hiring with a small TA team.",
    experience: [{ title: "Head of Talent", company: "Halcyon Cloud", duration: "1y 9m" }],
    education: [{ school: "Colorado School of Mines" }],
    signals: [],
    last_touch_at: "2026-05-10T08:00:00Z",
    value_usd: 21000
  }
];

export function getRecruiter(id: string): Recruiter | undefined {
  return RECRUITERS.find(r => r.id === id);
}
export function getCompany(id: string): Company | undefined {
  return COMPANIES.find(c => c.id === id);
}
export function getCompanyForRecruiter(recId: string): Company | undefined {
  const r = getRecruiter(recId);
  return r ? getCompany(r.company_id) : undefined;
}

// === Dashboard KPIs ===
export const KPIS = {
  emails_sent: 247,
  emails_sent_delta_pct: 14,
  reply_rate: 11.7,
  reply_rate_delta_pct: 3.2,
  meetings_booked: 12,
  meetings_booked_delta_pct: 33,
  pipeline_usd: 357000,
  pipeline_delta_pct: 18
};

// === Activity feed ===
export const ACTIVITY = [
  { id: "a1", ts: "2026-05-10T14:32:00Z", kind: "reply" as const,        who: "Rachel Mendoza", what: "replied to “Quick thought on your GTM roles” — interested" },
  { id: "a2", ts: "2026-05-10T13:00:00Z", kind: "meeting_booked" as const, who: "Megan Caldwell",  what: "booked Thu May 14 · 11:30am — discovery call" },
  { id: "a3", ts: "2026-05-10T11:14:00Z", kind: "email_sent" as const,    who: "Sarah Reyes",     what: "sent step 2/4 of “Series-C TA leaders” sequence" },
  { id: "a4", ts: "2026-05-10T10:42:00Z", kind: "scraped" as const,       who: "Workify",         what: "enriched 12 prospects from Indeed search · all verified" },
  { id: "a5", ts: "2026-05-10T09:55:00Z", kind: "email_sent" as const,    who: "Daniel Okafor",   what: "sent step 1/4 of “Series-B TA leaders” sequence" },
  { id: "a6", ts: "2026-05-10T09:18:00Z", kind: "call" as const,          who: "Hassan Khalil",   what: "20-min discovery — positive sentiment · action items added" },
  { id: "a7", ts: "2026-05-10T08:30:00Z", kind: "enrolled" as const,      who: "Olivia Park",     what: "enrolled in “Series-D People leaders” sequence" }
];

// === Calendar events (this week) ===
export const CALENDAR_EVENTS = [
  { id: "e1", title: "Megan Caldwell — Discovery",        start_at: "2026-05-14T11:30:00Z", end_at: "2026-05-14T12:00:00Z", type: "meeting" as const,         recruiter_id: "r5"  },
  { id: "e2", title: "Hassan Khalil — Discovery follow-up", start_at: "2026-05-15T14:00:00Z", end_at: "2026-05-15T14:30:00Z", type: "meeting" as const,         recruiter_id: "r11" },
  { id: "e3", title: "Follow up — Sarah Reyes",           start_at: "2026-05-13T09:30:00Z", end_at: "2026-05-13T09:35:00Z", type: "auto-followup" as const,   recruiter_id: "r1"  },
  { id: "e4", title: "Follow up — Marcus Hale",           start_at: "2026-05-14T15:00:00Z", end_at: "2026-05-14T15:05:00Z", type: "auto-followup" as const,   recruiter_id: "r6"  },
  { id: "e5", title: "Deep work — sequence audit",        start_at: "2026-05-13T13:00:00Z", end_at: "2026-05-13T15:00:00Z", type: "focus" as const            }
];

// === Sequences ===
export const SEQUENCES = [
  {
    id: "s1",
    name: "Series-C TA leaders",
    tone: "Peer / direct",
    status: "active" as const,
    total_sent: 142,
    reply_rate: 12.7,
    steps: [
      { step_index: 1, day_offset: 0,  subject: "21 days vs 60 — Paraform",                  body: "First touch.",  sent: 142, opened: 121, replied: 19 },
      { step_index: 2, day_offset: 3,  subject: "Following up on {{role}}",                  body: "Soft bump.",    sent: 118, opened: 96,  replied: 8  },
      { step_index: 3, day_offset: 7,  subject: "Worth 20 minutes?",                         body: "Specific ask.", sent: 87,  opened: 67,  replied: 5  },
      { step_index: 4, day_offset: 14, subject: "Closing this thread",                       body: "Breakup.",      sent: 64,  opened: 48,  replied: 3  }
    ]
  },
  {
    id: "s2",
    name: "Series-B TA leaders",
    tone: "Peer / direct",
    status: "active" as const,
    total_sent: 89,
    reply_rate: 14.6,
    steps: [
      { step_index: 1, day_offset: 0,  subject: "{{company}} hiring at scale",  body: "First touch.",  sent: 89, opened: 76, replied: 16 },
      { step_index: 2, day_offset: 4,  subject: "Quick thought on {{role}}",    body: "Soft bump.",    sent: 71, opened: 58, replied: 6  },
      { step_index: 3, day_offset: 9,  subject: "Sub-30-day fills",             body: "Specific ask.", sent: 53, opened: 41, replied: 4  }
    ]
  },
  {
    id: "s3",
    name: "Series-D People leaders",
    tone: "Executive / brief",
    status: "active" as const,
    total_sent: 38,
    reply_rate: 9.3,
    steps: [
      { step_index: 1, day_offset: 0, subject: "Brief — for {{first_name}}", body: "Single touch.", sent: 38, opened: 31, replied: 4 }
    ]
  }
];

// === Calls (history) ===
export const CALLS = [
  {
    id: "call1",
    recruiter_id: "r11",
    recruiter_name: "Hassan Khalil",
    recruiter_company: "Pelican Labs",
    duration_sec: 1247,
    started_at: "2026-05-10T09:18:00Z",
    disposition: "connected" as const,
    sentiment: "positive" as const,
    summary: "Hassan is hiring 4 senior ML engineers + 2 platform leads. Current avg time-to-fill is 78 days. Open to a 14-day trial with Paraform on the platform leads role.",
    action_items: [
      "Send Paraform case study from a Series B ML platform",
      "Schedule 14-day trial kickoff for Mon May 20",
      "Loop in Adaeze Nwosu (Maridian) — referral mentioned on call"
    ],
    transcript: [
      { speaker: "rep" as const,      t: "00:00", text: "Hassan, thanks for making time. How's the Pelican roadmap going?" },
      { speaker: "prospect" as const, t: "00:08", text: "Honestly — hiring is the bottleneck. We closed the B, the roadmap is good, but I'm 4 ML engineers behind plan." },
      { speaker: "rep" as const,      t: "00:34", text: "Got it. What's your current time-to-fill on the senior ML roles?" },
      { speaker: "prospect" as const, t: "00:41", text: "78 days. It's brutal. We've tried Triplebyte, Hired, two boutique agencies." }
    ]
  },
  {
    id: "call2",
    recruiter_id: "r5",
    recruiter_name: "Megan Caldwell",
    recruiter_company: "Verbena Health",
    duration_sec: 0,
    started_at: "2026-05-08T14:00:00Z",
    disposition: "voicemail" as const,
    sentiment: "neutral" as const,
    summary: "Left voicemail. Email follow-up sent.",
    action_items: ["Send case study", "Retry Thu May 14"]
  },
  {
    id: "call3",
    recruiter_id: "r1",
    recruiter_name: "Sarah Reyes",
    recruiter_company: "Lattice Forge",
    duration_sec: 422,
    started_at: "2026-05-06T15:30:00Z",
    disposition: "connected" as const,
    sentiment: "neutral" as const,
    summary: "Sarah is interested but locked in with two current vendors through Q3. Asked to reconnect in August.",
    action_items: ["Add to Aug 1 reminder", "Send quarterly recap then"]
  }
];
