interface Props {
  size?: number;
  withText?: boolean;
}

export function Logo({ size = 24, withText = true }: Props) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="wgrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00f5d4" />
            <stop offset="1" stopColor="#a07cff" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="22" height="22" rx="3" stroke="url(#wgrad)" strokeWidth="1.5" />
        <path d="M5.5 7.5 L8.5 16.5 L11.5 10.5 L14.5 16.5 L17.5 7.5" stroke="url(#wgrad)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {withText && (
        <span className="text-[15px] font-semibold tracking-tight text-text">Workify</span>
      )}
    </div>
  );
}
