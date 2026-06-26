"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
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
  const { theme } = useTheme()
  const [brandColor, setBrandColorState] = useState("#000000")

  const applyColor = useCallback((color: string) => {
    document.documentElement.style.setProperty("--brand-color", color)
    document.documentElement.style.setProperty("--brand-text-color", getContrastText(color))
  }, [])

  const setBrandColor = useCallback((color: string) => {
    setBrandColorState(color)
    localStorage.setItem(STORAGE_KEY, color)
    applyColor(color)
  }, [applyColor])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setBrandColorState(saved)
      applyColor(saved)
    } else {
      applyColor("#000000")
    }
  }, [theme, applyColor])

  return <ctx.Provider value={{ brandColor, setBrandColor }}>{children}</ctx.Provider>
}
