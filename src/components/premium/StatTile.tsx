import IconTile from "./IconTile"
import AnimatedNumber from "./AnimatedNumber"

interface StatTileProps {
  label: string
  value: number
  icon: string
  delta?: number
  series?: number[]
  accent?: "neon" | "blue" | "violet" | "amber"
  delay?: number
  href?: string
}

const accentMap: Record<NonNullable<StatTileProps["accent"]>, string> = {
  neon: "var(--accent)",
  blue: "#8b9a8a",
  violet: "#a89a87",
  amber: "#bba882",
}

export default function StatTile({
  label,
  value,
  icon,
  delta,
  accent = "neon",
  href,
}: StatTileProps) {
  const color = accentMap[accent]
  const Inner = (
    <div className="sa-tile group cursor-default">
      <div className="flex items-start justify-between mb-3">
        <IconTile name={icon} filled size={16} active className="!w-8 !h-8" />
        {typeof delta === "number" && (
          <span
            className="sa-chip"
            style={{
              color: delta >= 0 ? color : "#f87171",
              borderColor: "transparent",
              backgroundColor:
                delta >= 0
                  ? "color-mix(in srgb, " + color + " 14%, transparent)"
                  : "rgba(248, 113, 113, 0.14)",
            }}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="sa-eyebrow">{label}</p>
      <p className="sa-num text-3xl mt-1.5">
        <AnimatedNumber value={value} />
      </p>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {Inner}
      </a>
    )
  }
  return Inner
}