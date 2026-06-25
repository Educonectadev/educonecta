"use client"

import { useState, useEffect } from "react"

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
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
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setInstalled(true)
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  if (installed || dismissed || !show) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md animate-fade-in">
      <div className="bg-white rounded-[25px] border border-gray-200 shadow-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-black rounded-[15px] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">EC</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Instala EduConecta</p>
          <p className="text-xs text-gray-500">Accede rápido desde tu pantalla de inicio</p>
        </div>
        <button
          onClick={handleInstall}
          className="rounded-[30px] bg-black text-white px-4 py-2 text-xs font-medium hover:bg-gray-800 transition-all shrink-0"
        >
          Instalar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-black transition-all shrink-0"
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
