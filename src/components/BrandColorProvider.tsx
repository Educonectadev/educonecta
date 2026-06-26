"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useTheme } from "./ThemeProvider"

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

  const setBrandColor = useCallback((color: string) => {
    setBrandColorState(color)
    localStorage.setItem(STORAGE_KEY, color)
    document.documentElement.style.setProperty("--brand-color", color)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setBrandColorState(saved)
      document.documentElement.style.setProperty("--brand-color", saved)
    } else {
      document.documentElement.style.setProperty("--brand-color", "#000000")
    }
  }, [theme])

  return <ctx.Provider value={{ brandColor, setBrandColor }}>{children}</ctx.Provider>
}
