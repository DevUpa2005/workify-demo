"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Search, Upload, Send,
  Calendar, Phone, Settings
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const NAV: { href: string; label: string; icon: any; count?: string; }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads",     label: "Leads",     icon: Users,    count: "15" },
  { href: "/scrape",    label: "Scrape",    icon: Search           },
  { href: "/bulk",      label: "Bulk",      icon: Upload           },
  { href: "/sequences", label: "Sequences", icon: Send,    count: "3"  },
  { href: "/calendar",  label: "Calendar",  icon: Calendar, count: "5" },
  { href: "/calls",     label: "Calls",     icon: Phone,   count: "3"  },
  { href: "/settings",  label: "Settings",  icon: Settings         }
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-sidebar shrink-0 bg-bg-1 border-r border-line flex flex-col h-screen sticky top-0">
      <div className="h-topbar px-4 flex items-center border-b border-line shrink-0">
        <Logo />
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        <div className="eyebrow px-2 mb-2 mt-1">Workspace</div>
        {NAV.map(item => {
          const active = path?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2.5 h-8 pl-3 pr-2 rounded-sm mb-0.5 transition-colors ${
                active
                  ? "bg-bg-2 text-text"
                  : "text-text-3 hover:text-text-2 hover:bg-bg-2/50"
              }`}
            >
              {active && <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-cyan rounded-sm" />}
              <Icon size={14} strokeWidth={1.5} />
              <span className="text-[13px] flex-1">{item.label}</span>
              {item.count && (
                <span className="font-mono text-[11px] text-text-4" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-3 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-bg-2 border border-line flex items-center justify-center font-mono text-[11px] text-cyan">MD</div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-text leading-tight truncate">Mike DiNunno</div>
            <div className="font-mono text-[10px] text-text-4 truncate">paraform.com</div>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-green pulse-cyan" />
        </div>
      </div>
    </aside>
  );
}
