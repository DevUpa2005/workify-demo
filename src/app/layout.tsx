import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workify — Recruiter Outreach Intel",
  description: "AI sales OS for recruiters and small recruiting teams.",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en" data-density="regular">
      <body>{children}</body>
    </html>
  );
}
