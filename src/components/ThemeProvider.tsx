"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggle: () => {},
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

const STYLE_ID = "theme-transition-styles"

function applyTheme(next: Theme) {
  if (next === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
  localStorage.setItem("theme", next)
}

function injectStyles(css: string) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement("style")
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = css
}

function animateToggle(next: Theme) {
  const css = `
    ::view-transition-group(root) { animation-duration: 0.7s; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
    ::view-transition-new(root) { animation-name: reveal; }
    ::view-transition-old(root), .dark::view-transition-old(root) { animation: none; z-index: -1; }
    .dark::view-transition-new(root) { animation-name: reveal; }
    @keyframes reveal { from { clip-path: circle(0% at 50% 50%); } to { clip-path: circle(100% at 50% 50%); } }
  `
  injectStyles(css)

  const doSwitch = () => applyTheme(next)

  if (typeof document !== "undefined" && document.startViewTransition) {
    document.startViewTransition(doSwitch)
  } else {
    doSwitch()
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const mountedRef = useRef(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    const initial: Theme = stored === "dark" || stored === "light" ? stored : "light"
    setThemeState(initial)
    applyTheme(initial)
    mountedRef.current = true

    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme" && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue)
        applyTheme(e.newValue)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark"
    setThemeState(next)
    animateToggle(next)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    animateToggle(t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
