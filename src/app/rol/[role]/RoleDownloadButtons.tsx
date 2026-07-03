"use client"

import { useEffect, useState } from "react"
import { onDeferredPrompt, getDeferredPrompt } from "@/lib/deferred-prompt"

export default function RoleDownloadButtons({ role }: { role: string }) {
  const [prompt, setPrompt] = useState<any>(null)

  useEffect(() => {
    const existing = getDeferredPrompt()
    if (existing) setPrompt(existing)
    const unsub = onDeferredPrompt((p) => setPrompt(p))
    return unsub
  }, [])

  async function handleInstall() {
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === "accepted") setPrompt(null)
    } else {
      window.location.href = "/login"
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleInstall}
        className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /><path d="M12 2v8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/>
        </svg>
        Instalar {role === "dev" ? "Desarrollador" : role === "director" ? "Director" : role === "docente" ? "Docente" : role === "padre" ? "Padre de Familia" : "Alumno"}
      </button>
      <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
        Se instalará en tu dispositivo como una app. Abre directamente al inicio de sesión.
      </p>
    </div>
  )
}
