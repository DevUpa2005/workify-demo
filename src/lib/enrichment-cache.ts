"use client";

import { useEffect, useState } from "react";
import type { EnrichedDossier } from "./anthropic";

const CACHE_KEY = "workify_enrichment_v1";
const CACHE_VERSION = 1;

type CacheShape = {
  version: number;
  entries: Record<string, { data: EnrichedDossier; cached_at: string; }>;
};

function loadCache(): CacheShape {
  if (typeof window === "undefined") return { version: CACHE_VERSION, entries: {} };
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return { version: CACHE_VERSION, entries: {} };
    const parsed = JSON.parse(raw);
    if (parsed?.version !== CACHE_VERSION) return { version: CACHE_VERSION, entries: {} };
    return parsed;
  } catch {
    return { version: CACHE_VERSION, entries: {} };
  }
}

function saveCache(cache: CacheShape) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota
  }
}

export function getCachedEnrichment(prospectId: string): EnrichedDossier | null {
  const cache = loadCache();
  return cache.entries[prospectId]?.data || null;
}

export function setCachedEnrichment(prospectId: string, data: EnrichedDossier) {
  const cache = loadCache();
  cache.entries[prospectId] = {
    data,
    cached_at: new Date().toISOString()
  };
  saveCache(cache);
}

export function clearCachedEnrichment(prospectId: string) {
  const cache = loadCache();
  delete cache.entries[prospectId];
  saveCache(cache);
}

export function clearAllEnrichments() {
  saveCache({ version: CACHE_VERSION, entries: {} });
}

/**
 * Hook that returns the cached enrichment for a prospect (if any),
 * auto-fetches on mount if not cached, and provides a regenerate function.
 */
export function useEnrichment(prospectId: string, context: any) {
  const [data, setData] = useState<EnrichedDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // On mount: check cache
  useEffect(() => {
    if (!prospectId) return;
    const cached = getCachedEnrichment(prospectId);
    if (cached) {
      setData(cached);
    } else {
      // Auto-fetch on first dossier load
      void fetchEnrichment();
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospectId]);

  async function fetchEnrichment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enrich-dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as EnrichedDossier;
      setData(json);
      setCachedEnrichment(prospectId, json);
    } catch (e: any) {
      setError(e?.message || "fetch failed");
    } finally {
      setLoading(false);
    }
  }

  function regenerate() {
    clearCachedEnrichment(prospectId);
    setData(null);
    void fetchEnrichment();
  }

  return { data, loading, error, hydrated, regenerate };
}
