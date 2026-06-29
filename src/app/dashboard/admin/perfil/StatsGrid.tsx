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
          className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-[20px] p-5 text-center"
        >
          <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{s.value ?? 0}</p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{s.label}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
