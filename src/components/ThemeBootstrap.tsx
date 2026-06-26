"use client"

import { useEffect } from "react"

export default function ThemeBootstrap() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme")
      const html = document.documentElement
      if (stored === "dark") {
        html.classList.add("dark")
      } else {
        html.classList.remove("dark")
      }
    } catch {}
  }, [])
  return null
}