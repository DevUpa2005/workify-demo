interface Props {
  name: string;
  src?: string;
  size?: number;
}

const COLORS = ["#00f5d4", "#a07cff", "#3ad07c", "#f5b400", "#f04060"];

function initials(name: string) {
  return name
    .split(" ")
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return COLORS[h % COLORS.length];
}

export function Avatar({ name, src, size = 28 }: Props) {
  const inits = initials(name);
  const color = hashColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-sm object-cover border border-line"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-sm border font-mono font-medium select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `${color}10`,
        borderColor: `${color}40`,
        color: color
      }}
    >
      {inits}
    </div>
  );
}
