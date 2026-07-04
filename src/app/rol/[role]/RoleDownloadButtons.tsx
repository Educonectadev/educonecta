"use client"

import { useEffect, useState } from "react"
import { onDeferredPrompt, getDeferredPrompt } from "@/lib/deferred-prompt"

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true
}

const labelMap: Record<string, string> = {
  dev: "Desarrollador",
  director: "Director",
  docente: "Docente",
  padre: "Padre de Familia",
  alumno: "Alumno",
}

export default function RoleDownloadButtons({ role }: { role: string }) {
  const [prompt, setPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true)
      return
    }

    const existing = getDeferredPrompt()
    if (existing) setPrompt(existing)

    const unsub = onDeferredPrompt((p) => setPrompt(p))

    const installedHandler = () => setInstalled(true)
    window.addEventListener("appinstalled", installedHandler)

    return () => {
      unsub()
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [])

  async function handleInstall() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") {
      setPrompt(null)
      setInstalled(true)
    }
  }

  const roleName = labelMap[role] || role

  if (installed) {
    return (
      <div className="mt-3">
        <a
          href="/login"
          className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Ir al inicio de sesión
        </a>
        <p className="mt-2 text-xs text-muted-foreground">
          App instalada. Abre desde tu pantalla de inicio.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3">
      {prompt ? (
        <button
          onClick={handleInstall}
          className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /><path d="M12 2v8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/>
          </svg>
          Instalar {roleName}
        </button>
      ) : (
        <button
          onClick={() => window.location.href = "/login"}
          className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Ir al inicio de sesión
        </button>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {prompt
          ? "Se instalará en tu dispositivo como una app. Abre directamente al inicio de sesión."
          : "Usa el menú del navegador → Instalar app, o inicia sesión directamente."}
      </p>
    </div>
  )
}
