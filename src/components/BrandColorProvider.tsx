"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSession } from "@/lib/auth-context"

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
  ready: boolean
}

const DEFAULT_BY_ROLE: Record<string, string> = {
  SUPER_ADMIN: "#0f172a",
  INSTITUTIONAL_ADMIN: "#2563eb",
  TEACHER: "#059669",
  PARENT: "#d97706",
}

const ctx = createContext<BrandColorContext>({
  brandColor: "#000000",
  setBrandColor: () => {},
  ready: false,
})
export const useBrandColor = () => useContext(ctx)

const STORAGE_KEY = "educonecta_brand_color"

export default function BrandColorProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [brandColor, setBrandColorState] = useState<string>("#000000")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        if (session?.user?.id) {
          const res = await fetch("/api/user/brand-color", { cache: "no-store" })
          if (res.ok) {
            const { brandColor: serverColor } = await res.json()
            if (serverColor && !cancelled) {
              setBrandColorState(serverColor)
              try { localStorage.setItem(STORAGE_KEY, serverColor) } catch {}
              setReady(true)
              return
            }
          }
        }
      } catch {}
      if (cancelled) return
      try {
        const local = localStorage.getItem(STORAGE_KEY)
        if (local) setBrandColorState(local)
      } catch {}
      const fallback = (session?.user?.role && DEFAULT_BY_ROLE[session.user.role]) || "#000000"
      setBrandColorState((current) => current && current !== "#000000" ? current : (localStorage.getItem(STORAGE_KEY) || fallback))
      setReady(true)
    }
    load()
    return () => { cancelled = true }
  }, [session?.user?.id, session?.user?.role])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--brand-color", brandColor)
    root.style.setProperty("--brand-text-color", getContrastText(brandColor))
    if (ready) {
      try { localStorage.setItem(STORAGE_KEY, brandColor) } catch {}
    }
  }, [brandColor, ready])

  const setBrandColor = useCallback(async (color: string) => {
    setBrandColorState(color)
    try { localStorage.setItem(STORAGE_KEY, color) } catch {}
    try {
      await fetch("/api/user/brand-color", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColor: color }),
      })
    } catch {}
  }, [])

  return (
    <ctx.Provider value={{ brandColor, setBrandColor, ready }}>
      {children}
    </ctx.Provider>
  )
}
