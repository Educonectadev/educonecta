"use client"

import { motion } from "framer-motion"
import { getIcon } from "./iconRegistry"
import type { LucideProps } from "lucide-react"

interface IconTileProps {
  name: string
  size?: number
  className?: string
  filled?: boolean
  active?: boolean
}

export default function IconTile({
  name,
  size = 18,
  className = "",
  filled = false,
  active = false,
}: IconTileProps) {
  return (
    <motion.span
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={[
        "inline-flex items-center justify-center rounded-full",
        filled
          ? active
            ? "bg-black/15"
            : "bg-white/8 dark:bg-white/10"
          : "",
        className,
      ].join(" ")}
      style={{ width: size + 14, height: size + 14 }}
    >
      {getIcon(name, { size, strokeWidth: 1.8 })}
    </motion.span>
  )
}