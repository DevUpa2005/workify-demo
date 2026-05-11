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
  source: "linkdapi" | "fallback";
}

async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Look up a LinkedIn profile by username (the slug from the LinkedIn URL).
 * Example: linkedin.com/in/ryanroslansky → username = "ryanroslansky"
 */
export async function getProfileByUsername(username: string): Promise<NormalizedProfile | null> {
  try {
    const url = `${BASE}/profile/overview?username=${encodeURIComponent(username)}`;
    const res = await fetchWithTimeout(url, {
      headers: { "Authorization": `Bearer ${LINKDAPI_KEY}` }
    });

    if (!res.ok) {
      console.error("LinkdAPI error:", res.status, await res.text());
      return null;
    }

    const json = (await res.json()) as LinkdAPIProfile;
    if (!json.success || !json.data) return null;

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
 * Best-effort search by name + company.
 * LinkdAPI's search isn't 1:1 with name+company, so we try to extract a username heuristically.
 * For the demo, we fall back to a known-username lookup if we can guess the slug.
 */
export async function searchByNameAndCompany(name: string, company?: string): Promise<NormalizedProfile | null> {
  // Heuristic: convert "Sarah Chen" → "sarah-chen" as a username guess
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  // Try the slug directly
  let profile = await getProfileByUsername(slug);
  if (profile) return profile;

  // Try slug + first initial of company (common LinkedIn collision-resolution pattern)
  if (company) {
    const initial = company.toLowerCase().replace(/[^a-z]/g, "").charAt(0);
    const altSlug = `${slug}-${initial}`;
    profile = await getProfileByUsername(altSlug);
    if (profile) return profile;
  }

  return null;
}
