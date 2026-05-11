"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Command, Zap } from "lucide-react";
import { TrustBadge } from "@/components/ui/TrustBadge";

function pathToBreadcrumbs(path: string): string[] {
  if (!path || path === "/") return ["Workify"];
  return path.split("/").filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1));
}

export function Topbar() {
  const path = usePathname();
  const router = useRouter();
  const crumbs = pathToBreadcrumbs(path || "");
  const [density, setDensity] = useState<"regular" | "compact">("regular");
  const [q, setQ] = useState("");

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/scrape?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <header className="h-topbar bg-bg-1 border-b border-line flex items-center px-5 sticky top-0 z-10 shrink-0">
      <nav className="flex items-center gap-2 text-[12px]">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className={i === crumbs.length - 1 ? "text-text" : "text-text-3"}>{c}</span>
            {i < crumbs.length - 1 && <span className="text-text-4">/</span>}
          </span>
        ))}
      </nav>

      <form onSubmit={onSearch} className="flex-1 max-w-md mx-auto relative">
        <Search size={13} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search prospects, companies, or paste a LinkedIn URL..."
          className="w-full h-7 bg-bg-2 border border-line rounded-sm pl-8 pr-12 text-[12px] text-text placeholder:text-text-4 focus:border-line-3"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-text-4 font-mono text-[10px]">
          <Command size={10} /><span>K</span>
        </span>
      </form>

      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={() => setDensity(d => d === "regular" ? "compact" : "regular")}
          className="text-text-3 hover:text-text-2 font-mono text-[10px] uppercase tracking-wider px-2 h-6 border border-line rounded-sm"
        >
          {density}
        </button>

        <div className="flex items-center gap-2">
          <TrustBadge tier="verified" source="Gmail" />
          <TrustBadge tier="verified" source="LinkdAPI" />
          <span className="flex items-center gap-1 font-mono text-[10px] text-cyan">
            <Zap size={10} strokeWidth={1.5} />
            <span className="pulse-cyan">LIVE</span>
          </span>
        </div>
      </div>
    </header>
  );
}
