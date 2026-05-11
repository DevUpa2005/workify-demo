import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:   "bg-cyan text-bg hover:brightness-110 active:brightness-95 disabled:bg-cyan/30 disabled:cursor-not-allowed font-semibold",
  secondary: "bg-transparent border border-line text-text-2 hover:border-line-3 hover:text-text",
  ghost:     "bg-transparent text-text-2 hover:bg-bg-2 hover:text-text",
  danger:    "bg-transparent border border-rose text-rose hover:bg-rose/10"
};

const SIZES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[12px]",
  md: "h-8 px-3 text-[13px]",
  lg: "h-10 px-4 text-[14px]"
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 transition-colors duration-100 rounded-sm whitespace-nowrap ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
}
