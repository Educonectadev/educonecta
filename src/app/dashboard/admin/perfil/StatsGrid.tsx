"use client"

import { motion } from "framer-motion"

export default function StatsGrid({ stats }: { stats: { label: string; value: number | null }[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {stats.map((s) => (
        <motion.div
          key={s.label}
          variants={{
            hidden: { opacity: 0, scale: 0.6 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { type: "spring", damping: 18, stiffness: 260 },
            },
          }}
          className="sa-tile text-center"
        >
          <p className="sa-num text-2xl" style={{ color: "var(--foreground)" }}>{s.value ?? 0}</p>
          <p className="sa-eyebrow mt-1">{s.label}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
