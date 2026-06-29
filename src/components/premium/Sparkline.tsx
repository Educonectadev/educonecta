"use client"

import { motion } from "framer-motion"
import { useId } from "react"

interface SparklineProps {
  values: number[]
  height?: number
  stroke?: string
  fill?: string
  className?: string
}

export default function Sparkline({
  values,
  height = 44,
  stroke,
  fill,
  className,
}: SparklineProps) {
  const id = useId().replace(/:/g, "")
  if (!values.length) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 100
  const h = height
  const stepX = w / Math.max(values.length - 1, 1)

  const points = values
    .map((v, i) => {
      const x = i * stepX
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")

  const lastX = (values.length - 1) * stepX
  const lastY = h - ((values[values.length - 1] - min) / range) * h

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      width="100%"
      height={h}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill ?? "var(--neon)"} stopOpacity="0.45" />
          <stop offset="100%" stopColor={fill ?? "var(--neon)"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#spark-fill-${id})`}
      />
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        points={points}
        fill="none"
        stroke={stroke ?? "var(--neon)"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 240, damping: 18 }}
        cx={lastX}
        cy={lastY}
        r="2.2"
        fill={stroke ?? "var(--neon)"}
      />
    </svg>
  )
}