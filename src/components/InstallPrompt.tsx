"use client"

import { useState, useEffect } from "react"
import { setDeferredPrompt, clearDeferredPrompt } from "@/lib/deferred-prompt"

type Platform = "android" | "ios" | "desktop" | "other"

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent
  if (ua.includes("Android")) return "android"
  if (ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iPod")) return "ios"
  return "desktop"
}

function isInstalled(): boolean {
  if (typeof window === "undefined") return false
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  if ((navigator as any).standalone === true) return true
  return false
}

const DISMISS_KEY = "ec-install-dismissed"

export default function InstallPrompt() {
  const [deferredPrompt, setDeferred] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const platform = detectPlatform()

  useEffect(() => {
    if (isInstalled()) return
    if (localStorage.getItem(DISMISS_KEY)) {
      setDismissed(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setDeferred(e)
      setShow(true)
    }

    const installedHandler = () => {
      setShow(false)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", installedHandler)

    navigator.serviceWorker?.register("/sw.js")

    if (platform === "ios") {
      setShow(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [platform])

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true")
    setDismissed(true)
  }

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShow(false)
        localStorage.setItem(DISMISS_KEY, "true")
      }
      clearDeferredPrompt()
      setDeferred(null)
    }
  }

  if (isInstalled() || dismissed || !show) return null

  if (platform === "ios") {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm animate-fade-in">
        <div className="sa-surface sa-surface-hover p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /><path d="M12 2v8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Instalar EduConecta</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Presiona <span className="font-medium text-foreground">Compartir</span>{" "}
                <svg className="inline-block w-4 h-4 align-text-bottom" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.633l-4.94 2.47a3 3 0 100 4.326l4.94 2.47a3 3 0 101.06-1.06l-4.94-2.47a3.03 3.03 0 000-1.106l4.94-2.47A3 3 0 1015 8z"/></svg>
                {" "}y luego <span className="font-medium text-foreground">"Agregar a pantalla de inicio"</span>.
              </p>
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground shrink-0 p-1" aria-label="Cerrar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm animate-fade-in">
      <div className="sa-surface sa-surface-hover p-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /><path d="M12 2v8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Instalar EduConecta</p>
            <p className="text-xs text-muted-foreground">Accede rápido desde tu pantalla de inicio</p>
          </div>
          <button onClick={handleInstall} className="sa-btn sa-btn-primary text-xs px-4 py-2 shrink-0">
            Instalar
          </button>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground shrink-0 p-1" aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
