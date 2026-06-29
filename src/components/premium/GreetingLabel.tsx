"use client"

import { useEffect, useState } from "react"

function greetForHour(h: number) {
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

export default function GreetingLabel() {
  const [greeting, setGreeting] = useState("")
  useEffect(() => {
    setGreeting(greetForHour(new Date().getHours()))
  }, [])
  return <span suppressHydrationWarning>{greeting}</span>
}