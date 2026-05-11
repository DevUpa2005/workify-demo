import { notFound } from "next/navigation";
import { getRecruiter, getCompanyForRecruiter } from "@/mocks/seed-data";
import { DossierClient } from "./DossierClient";
import type { Recruiter, Company, TrustTier } from "@/lib/types";

export const dynamic = "force-dynamic";

// Profile shape sent from the Scrape page via URL params for live results
interface LiveProfile {
  full_name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company?: string;
  email?: string;
  location?: string;
  linkedin_url?: string;
  headline?: string;
  avatar_url?: string;
  about?: string;
  industry?: string;
  size?: string;
  stage?: string;
  hot_role?: string;
  source?: "linkdapi" | "inferred";
}

// Convert the URL-passed profile into the Recruiter/Company shape that DossierClient expects
function liveToData(d: LiveProfile): { recruiter: Recruiter; company: Company; } {
  const trust: TrustTier = d.source === "linkdapi" ? "verified" : "inferred";
  const first_name = d.first_name || d.full_name.split(" ")[0] || "";
  const last_name = d.last_name || d.full_name.split(" ").slice(1).join(" ") || "";
  const companyName = d.company || "Unknown Co.";

  const company: Company = {
    id: "live-co",
    legal_name: companyName,
    domain: companyName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
    trust,
    industry: d.industry,
    size: d.size,
    funding_stage: d.stage,
    description: d.industry
      ? `${d.industry} company. ${d.stage ? `Currently at ${d.stage} scale, building toward next funding milestone.` : "Growth-stage SaaS."}`
      : undefined,
    signals: [
      ...(d.stage    ? [{ label: "Funding stage", value: d.stage,    source: "inferred" as const, trust: "inferred" as const }] : []),
      ...(d.industry ? [{ label: "Industry",      value: d.industry, source: "inferred" as const, trust: "inferred" as const }] : []),
      ...(d.size     ? [{ label: "Headcount",     value: d.size,     source: "inferred" as const, trust: "inferred" as const }] : [])
    ],
    hiring_signals: d.hot_role ? [{ role: d.hot_role, posted: "4 days ago" }] : []
  };

  const recruiter: Recruiter = {
    id: "live",
    company_id: "live-co",
    full_name: d.full_name,
    first_name,
    last_name,
    title: d.title || "Talent leader",
    email: d.email || "",
    email_status: trust,
    trust,
    pipeline_stage: "new",
    linkedin_url: d.linkedin_url,
    location: d.location,
    avatar_url: d.avatar_url,
    headline: d.headline,
    about: d.about,
    experience: d.title && d.company
      ? [{ title: d.title, company: d.company, duration: "Current role" }]
      : [],
    education: [],
    signals: [
      ...(d.title    ? [{ label: "Role",     value: d.title,    source: "inferred" as const, trust: trust }] : []),
      ...(d.location ? [{ label: "Based in", value: d.location, source: "inferred" as const, trust: trust }] : [])
    ],
    value_usd: 18000
  };

  return { recruiter, company };
}

export default function DossierPage({
  params,
  searchParams
}: {
  params: { id: string; };
  searchParams: { d?: string; };
}) {
  // Live mode — ad-hoc profile passed from the Scrape page via URL params
  if (params.id === "live" && searchParams.d) {
    try {
      const decoded = decodeURIComponent(searchParams.d);
      const liveProfile: LiveProfile = JSON.parse(decoded);
      if (!liveProfile.full_name) notFound();
      const { recruiter, company } = liveToData(liveProfile);
      return <DossierClient recruiter={recruiter} company={company} />;
    } catch (e) {
      console.error("Live dossier decode error:", e);
      notFound();
    }
  }

  // Seeded mode — look up the prospect from the static mock data
  const recruiter = getRecruiter(params.id);
  if (!recruiter) notFound();
  const company = getCompanyForRecruiter(params.id);
  if (!company) notFound();

  return <DossierClient recruiter={recruiter} company={company} />;
}
