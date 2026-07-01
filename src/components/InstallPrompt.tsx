"use client"

import { useState, useEffect } from "react"
import { setDeferredPrompt, clearDeferredPrompt } from "@/lib/deferred-prompt"

export default function InstallPrompt() {
  const [localPrompt, setLocalPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setLocalPrompt(e)
      setShow(true)
    }

    const installedHandler = () => {
      setInstalled(true)
      setShow(false)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", installedHandler)

    navigator.serviceWorker?.register("/sw.js")

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [])

  async function handleInstall() {
    if (!localPrompt) return
    localPrompt.prompt()
    const { outcome } = await localPrompt.userChoice
    if (outcome === "accepted") {
      setInstalled(true)
      setShow(false)
    }
    clearDeferredPrompt()
    setLocalPrompt(null)
  }

  if (installed || dismissed || !show) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-[25px] border border-gray-200 dark:border-zinc-800 shadow-xl dark:shadow-black/50 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-black dark:bg-white rounded-[15px] flex items-center justify-center shrink-0">
          <span className="text-white dark:text-black font-bold text-sm">EC</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white/90">Instala EduConecta</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Accede rápido desde tu pantalla de inicio</p>
        </div>
        <button
          onClick={handleInstall}
          className="rounded-[30px] btn-primary px-4 py-2 text-xs font-medium shrink-0"
        >
          Instalar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-all shrink-0"
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
