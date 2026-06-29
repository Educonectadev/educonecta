"use client"

import { motion } from "framer-motion"
import IconTile from "./IconTile"
import Sparkline from "./Sparkline"
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
  neon: "var(--neon)",
  blue: "#38bdf8",
  violet: "#a855f7",
  amber: "#fbbf24",
}

export default function StatTile({
  label,
  value,
  icon,
  delta,
  series,
  accent = "neon",
  delay = 0,
  href,
}: StatTileProps) {
  const color = accentMap[accent]
  const Inner = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{ y: -3 }}
      className="sa-tile group cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <IconTile
          name={icon}
          filled
          size={16}
          active
          className="!w-8 !h-8"
        />
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
      {series && series.length > 0 && (
        <div className="mt-3 -mx-1">
          <Sparkline values={series} stroke={color} fill={color} height={36} />
        </div>
      )}
    </motion.div>
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