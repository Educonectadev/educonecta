"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface NeonCardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  glow?: boolean
  padded?: boolean
  delay?: number
}

export default function NeonCard({
  children,
  className = "",
  hoverable = true,
  glow = false,
  padded = true,
  delay = 0,
}: NeonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={hoverable ? { y: -3 } : undefined}
      className={[
        "sa-surface",
        hoverable ? "sa-surface-hover" : "",
        glow ? "sa-glow" : "",
        padded ? "p-6" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </motion.div>
  )
}