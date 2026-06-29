"use client"

import { useEffect, useState } from "react"

export default function TodayLabel() {
  const [label, setLabel] = useState("")
  useEffect(() => {
    const d = new Date().toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    setLabel(d)
  }, [])
  return <span suppressHydrationWarning>{label}</span>
}