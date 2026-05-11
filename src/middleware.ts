import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/leads", "/scrape", "/bulk", "/dossier", "/sequences", "/calendar", "/calls", "/settings"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some(p => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const cookie = req.cookies.get("workify_gate")?.value;
  if (cookie === "open") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/leads/:path*", "/scrape/:path*", "/bulk/:path*", "/dossier/:path*", "/sequences/:path*", "/calendar/:path*", "/calls/:path*", "/settings/:path*"]
};
