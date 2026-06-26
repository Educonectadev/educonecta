"use client"

import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"

export default function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number
  suffix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let i = 0
    const timer = setInterval(() => {
      i++
      const next = Math.min(Math.round(increment * i), value)
      setCurrent(next)
      if (i >= steps || next >= value) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref}>
      {current.toLocaleString("es-PE")}
      {suffix}
    </span>
  )
}
