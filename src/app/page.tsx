"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function GatePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-bg" />}>
      <Gate />
    </Suspense>
  );
}

function Gate() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params?.get("from") || "/dashboard";

  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      router.push(from);
    } else {
      setErr("Invalid password.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background grid — Bloomberg style */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "44px 44px"
        }}
      />

      <div className="relative w-full max-w-[420px]">
        <div className="flex items-center justify-between mb-12">
          <Logo />
          <Eyebrow tone="cyan" className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-cyan inline-block" />
            PRIVATE BETA · ACCESS REQUIRED
          </Eyebrow>
        </div>

        <h1 className="serif text-[44px] leading-[1.05] mb-2 text-text">
          Welcome to <span className="logo-gradient">Workify</span>
        </h1>
        <p className="text-text-3 text-[13px] leading-relaxed mb-10 max-w-[340px]">
          AI-grade recruiter intelligence. Find verified contacts, infer pain points, send personalized sequences — all from one dense workspace.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Eyebrow className="mb-2">Access password</Eyebrow>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter beta password"
              className="w-full h-10 bg-bg-1 border border-line rounded-sm px-3 text-[13px] text-text placeholder:text-text-4 focus:border-cyan"
            />
            {err && <div className="mt-2 text-rose font-mono text-[11px]">{err}</div>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            disabled={loading}
            icon={loading ? null : <ArrowRight size={14} strokeWidth={2} />}
          >
            {loading ? "Verifying..." : "Enter Workify"}
          </Button>
        </form>

        <div className="mt-10 pt-6 border-t border-line flex items-center justify-between">
          <Eyebrow>v1.0.0 · build 04a7</Eyebrow>
          <Eyebrow className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-green inline-block" />
            All systems operational
          </Eyebrow>
        </div>
      </div>

      {/* Bottom-left footer */}
      <div className="absolute bottom-6 left-6">
        <Eyebrow>Workify · 2026 · For Paraform team only</Eyebrow>
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>
        {new Date().toISOString().slice(0, 10).replace(/-/g, ".")}
      </div>
    </main>
  );
}
