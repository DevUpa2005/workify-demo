import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  tone?: "default" | "cyan";
  className?: string;
}

export function Eyebrow({ children, tone = "default", className = "" }: Props) {
  return (
    <div
      className={`eyebrow ${tone === "cyan" ? "eyebrow-cyan" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
