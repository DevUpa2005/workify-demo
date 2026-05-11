// LinkdAPI wrapper — server-side only, never call from the browser.
// Docs: https://linkdapi.com/docs

const LINKDAPI_KEY = process.env.LINKDAPI_KEY!;
const BASE = "https://linkdapi.com/api/v1";

interface DateYM {
  year?: number;
  month?: number;
  day?: number;
}

interface LinkdAPIPosition {
  title?: string;
  companyName?: string;
  start?: DateYM | null;
  end?: DateYM | null;
  description?: string;
  location?: string;
  employmentType?: string;
}

interface LinkdAPIEducation {
  schoolName?: string;
  degree?: string;
  fieldOfStudy?: string;
  start?: DateYM | null;
  end?: DateYM | null;
}

interface LinkdAPIGeo {
  full?: string;
  country?: string;
  countryCode?: string;
  city?: string;
}

interface LinkdAPIProfile {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    username?: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    summary?: string;
    about?: string;
    profilePicture?: string;
    geo?: LinkdAPIGeo;
    location?: string | LinkdAPIGeo | { fullLocation?: string; city?: string; countryName?: string; countryCode?: string };
    position?: LinkdAPIPosition[];
    fullPositions?: LinkdAPIPosition[];
    currentPositions?: { companyName?: string; company?: { name?: string } }[];
    educations?: LinkdAPIEducation[];
  };
  error?: string;
}

export interface NormalizedProfile {
  full_name: string;
  first_name: string;
  last_name: string;
  headline: string;
  title: string;
  company: string;
  location: string;
  avatar_url: string;
  about: string;
  linkedin_url: string;
  experience: { title: string; company: string; duration: string; }[];
  education: { school: string; degree?: string; }[];
  source: "linkdapi";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtMonthYear(d?: DateYM | null): string {
  if (!d || !d.year) return "";
  const m = d.month;
  const mStr = m && m >= 1 && m <= 12 ? `${MONTHS[m - 1]} ` : "";
  return `${mStr}${d.year}`;
}

function fmtDuration(start?: DateYM | null, end?: DateYM | null): string {
  const startStr = fmtMonthYear(start);
  if (!startStr) return "";
  const isPresent = !end || !end.year;
  const endStr = isPresent ? "Present" : fmtMonthYear(end);
  return `${startStr} — ${endStr}`;
}

function normalizeLocation(d: NonNullable<LinkdAPIProfile["data"]>): string {
  if (d.geo) {
    const full = d.geo.full || [d.geo.city, d.geo.country].filter(Boolean).join(", ");
    if (full) return full;
  }
  if (d.location) {
    if (typeof d.location === "string") return d.location;
    const loc = d.location as any;
    return loc.full || loc.fullLocation || [loc.city, loc.country || loc.countryName].filter(Boolean).join(", ") || "";
  }
  return "";
}

async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Look up a LinkedIn profile by exact username (the slug from the LinkedIn URL).
 * Returns null if not found, hits an error, or returns empty data.
 */
export async function getProfileByUsername(username: string): Promise<NormalizedProfile | null> {
  if (!username) return null;
  try {
    const url = `${BASE}/profile/full?username=${encodeURIComponent(username)}`;
    const res = await fetchWithTimeout(url, {
      headers: { "X-linkdapi-apikey": LINKDAPI_KEY }
    });

    if (!res.ok) {
      console.error("LinkdAPI HTTP error:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const json = (await res.json()) as LinkdAPIProfile;
    if (!json.success || !json.data) return null;
    if (!json.data.firstName && !json.data.lastName) return null;

    const d = json.data;
    const first_name = d.firstName || "";
    const last_name = d.lastName || "";
    const full_name = `${first_name} ${last_name}`.trim();

    const current = d.position?.[0];
    const expSource = (d.fullPositions && d.fullPositions.length > 0) ? d.fullPositions : (d.position || []);

    return {
      full_name,
      first_name,
      last_name,
      headline: d.headline?.trim() || "",
      title: current?.title || "",
      company: current?.companyName || "",
      location: normalizeLocation(d),
      avatar_url: d.profilePicture || "",
      about: d.summary || d.about || "",
      linkedin_url: `https://www.linkedin.com/in/${d.username || username}`,
      experience: expSource.slice(0, 5).map(p => ({
        title: p.title || "",
        company: p.companyName || "",
        duration: fmtDuration(p.start, p.end)
      })),
      education: (d.educations || []).slice(0, 3).map(e => ({
        school: e.schoolName || "",
        degree: e.degree || e.fieldOfStudy
      })),
      source: "linkdapi"
    };
  } catch (e) {
    console.error("LinkdAPI lookup failed:", e);
    return null;
  }
}

/**
 * Extract a LinkedIn slug from any string that looks like a LinkedIn URL.
 * Handles all of these:
 *   https://www.linkedin.com/in/satyanadella
 *   www.linkedin.com/in/satyanadella
 *   linkedin.com/in/satyanadella/
 *   linkedin.com/in/satya-nadella-1234
 */
export function extractLinkedInSlug(input: string): string | null {
  if (!input) return null;
  const match = input.match(/(?:linkedin\.com\/in\/)([a-zA-Z0-9\-_.]+)/i);
  if (match && match[1]) {
    return match[1].replace(/\/$/, "").trim();
  }
  return null;
}

/**
 * Best-effort search by free-text name input.
 * Tries multiple slug variations because LinkedIn slugs are not 1:1 with names.
 * Returns the first successful hit, or null if no variation matches.
 */
export async function searchByName(rawInput: string): Promise<NormalizedProfile | null> {
  const cleaned = rawInput
    .toLowerCase()
    .replace(/[^a-z0-9\s.\-]/g, "")
    .trim();
  if (!cleaned) return null;

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;

  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";

  const variants = new Set<string>();
  if (last) {
    variants.add(`${first}-${last}`);
    variants.add(`${first}${last}`);
    variants.add(`${first}.${last}`);
    variants.add(`${first}-${last[0]}`);
    variants.add(`${first[0]}${last}`);
    variants.add(`${first}${last[0]}`);
  }
  variants.add(first);

  for (const slug of variants) {
    const profile = await getProfileByUsername(slug);
    if (profile) return profile;
  }
  return null;
}
