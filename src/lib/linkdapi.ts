// LinkdAPI wrapper — server-side only, never call from the browser.
// Docs: https://linkdapi.com/docs

const LINKDAPI_KEY = process.env.LINKDAPI_KEY!;
const BASE = "https://api.linkdapi.com/v1";

interface LinkdAPIProfile {
  success?: boolean;
  data?: {
    username?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    headline?: string;
    about?: string;
    location?: string;
    profilePicture?: string;
    publicIdentifier?: string;
    CurrentPositions?: { title?: string; name?: string; companyName?: string; companyUrl?: string; }[];
    PastPositions?: { title?: string; companyName?: string; duration?: string; }[];
    Education?: { school?: string; degree?: string; field?: string; }[];
    followerCount?: number;
    connectionCount?: number;
    urn?: string;
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
    const url = `${BASE}/profile/overview?username=${encodeURIComponent(username)}`;
    const res = await fetchWithTimeout(url, {
      headers: { "Authorization": `Bearer ${LINKDAPI_KEY}` }
    });

    if (!res.ok) {
      console.error("LinkdAPI HTTP error:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const json = (await res.json()) as LinkdAPIProfile;
    if (!json.success || !json.data) return null;
    // Reject empty shells — profile must have at least a name
    if (!json.data.fullName && !json.data.firstName && !json.data.lastName) return null;

    const d = json.data;
    const current = d.CurrentPositions?.[0];
    const first_name = d.firstName || (d.fullName || "").split(" ")[0] || "";
    const last_name = d.lastName || (d.fullName || "").split(" ").slice(1).join(" ") || "";

    return {
      full_name: d.fullName || `${first_name} ${last_name}`.trim(),
      first_name,
      last_name,
      headline: d.headline || "",
      title: current?.title || "",
      company: current?.name || current?.companyName || "",
      location: d.location || "",
      avatar_url: d.profilePicture || "",
      about: d.about || "",
      linkedin_url: d.publicIdentifier ? `https://www.linkedin.com/in/${d.publicIdentifier}` : `https://www.linkedin.com/in/${username}`,
      experience: (d.PastPositions || []).slice(0, 4).map(p => ({
        title: p.title || "",
        company: p.companyName || "",
        duration: p.duration || ""
      })),
      education: (d.Education || []).slice(0, 3).map(e => ({
        school: e.school || "",
        degree: e.degree
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

  // Try many slug variants in order of likelihood
  const variants = new Set<string>();
  if (last) {
    variants.add(`${first}-${last}`);   // sarah-chen
    variants.add(`${first}${last}`);    // sarahchen
    variants.add(`${first}.${last}`);   // sarah.chen
    variants.add(`${first}-${last[0]}`); // sarah-c
    variants.add(`${first[0]}${last}`); // schen
    variants.add(`${first}${last[0]}`); // sarahc
  }
  variants.add(first); // just sarah (long shot)

  for (const slug of variants) {
    const profile = await getProfileByUsername(slug);
    if (profile) return profile;
  }
  return null;
}
