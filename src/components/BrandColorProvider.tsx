"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "./ThemeProvider"

function getLuminance(hex: string): number {
  const c = hex.replace("#", "")
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function getContrastText(bgHex: string): string {
  return getLuminance(bgHex) > 0.5 ? "#000000" : "#ffffff"
}

interface BrandColorContext {
  brandColor: string
  setBrandColor: (color: string) => void
}

const ctx = createContext<BrandColorContext>({ brandColor: "#000000", setBrandColor: () => {} })
export const useBrandColor = () => useContext(ctx)

const STORAGE_KEY = "educonecta_brand_color"

export default function BrandColorProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [brandColor, setBrandColorState] = useState("#000000")
  const [ready, setReady] = useState(false)
  const savedRef = useRef(false)

  const isDashboard = pathname?.startsWith("/dashboard")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/brand-color")
        if (res.ok) {
          const { brandColor: serverColor } = await res.json()
          if (serverColor) {
            setBrandColorState(serverColor)
            localStorage.setItem(STORAGE_KEY, serverColor)
            setReady(true)
            return
          }
        }
      } catch {}
      const local = localStorage.getItem(STORAGE_KEY)
      if (local) {
        setBrandColorState(local)
      }
      setReady(true)
    }
    load()
  }, [theme])

  useEffect(() => {
    if (!isDashboard || !ready) {
      const root = document.documentElement
      root.style.removeProperty("--brand-color")
      root.style.removeProperty("--brand-text-color")
      return
    }
    const root = document.documentElement
    root.style.setProperty("--brand-color", brandColor)
    root.style.setProperty("--brand-text-color", getContrastText(brandColor))
  }, [brandColor, isDashboard, ready])

  const setBrandColor = useCallback(async (color: string) => {
    setBrandColorState(color)
    localStorage.setItem(STORAGE_KEY, color)
    try {
      await fetch("/api/user/brand-color", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColor: color }),
      })
    } catch {}
  }, [])

  return (
    <ctx.Provider value={{ brandColor, setBrandColor }}>
      {children}
    </ctx.Provider>
  )
}
