"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSession } from "@/lib/auth-context"

function getLuminance(hex: string): number {
  const c = (hex || "").replace("#", "")
  if (c.length < 6) return 0
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function getContrastText(bgHex: string): string {
  return getLuminance(bgHex) > 0.5 ? "#000000" : "#ffffff"
}

function normalizeHex(input: string | null | undefined, fallback: string): string {
  if (!input || typeof input !== "string") return fallback
  const v = input.trim()
  if (!/^#?[0-9a-fA-F]{6}$/.test(v)) return fallback
  return v.startsWith("#") ? v.toLowerCase() : `#${v.toLowerCase()}`
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

const SAFE_FALLBACK = "#000000"

const ctx = createContext<BrandColorContext>({
  brandColor: SAFE_FALLBACK,
  setBrandColor: () => {},
  ready: false,
})
export const useBrandColor = () => useContext(ctx)

const STORAGE_KEY = "educonecta_brand_color"

export default function BrandColorProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [brandColor, setBrandColorState] = useState<string>(SAFE_FALLBACK)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const fallback = (session?.user?.role && DEFAULT_BY_ROLE[session.user.role]) || SAFE_FALLBACK
      let resolved: string | null = null
      try {
        if (session?.user?.id) {
          const res = await fetch("/api/user/brand-color", { cache: "no-store" })
          if (res.ok) {
            const { brandColor: serverColor } = await res.json()
            resolved = normalizeHex(serverColor, fallback)
          }
        }
      } catch {}
      if (cancelled) return
      if (!resolved) {
        try {
          const local = localStorage.getItem(STORAGE_KEY)
          resolved = normalizeHex(local, fallback)
        } catch {
          resolved = fallback
        }
      }
      if (!resolved || getLuminance(resolved) > 0.92) {
        resolved = fallback
      }
      setBrandColorState(resolved)
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
    const normalized = normalizeHex(color, SAFE_FALLBACK)
    setBrandColorState(normalized)
    try { localStorage.setItem(STORAGE_KEY, normalized) } catch {}
    try {
      await fetch("/api/user/brand-color", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColor: normalized }),
      })
    } catch {}
  }, [])

  return (
    <ctx.Provider value={{ brandColor, setBrandColor, ready }}>
      {children}
    </ctx.Provider>
  )
}
