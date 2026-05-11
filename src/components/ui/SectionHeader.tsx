import { ReactNode } from "react";

interface Props {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, eyebrow, actions, className = "" }: Props) {
  return (
    <div className={`flex items-end justify-between mb-3 ${className}`}>
      <div>
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h2 className="text-[17px] font-semibold text-text">{title}</h2>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
