"use client"

import { useState, useEffect } from "react"
import { getDeferredPrompt, onDeferredPrompt, clearDeferredPrompt } from "@/lib/deferred-prompt"

export default function InstallButton({ label }: { label: string }) {
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const existing = getDeferredPrompt()
    if (existing) {
      setCanInstall(true)
      return
    }

    const unsub = onDeferredPrompt((p) => {
      if (p) setCanInstall(true)
    })
    return unsub
  }, [])

  async function handleInstall() {
    const prompt = getDeferredPrompt()
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") {
      setCanInstall(false)
    }
    clearDeferredPrompt()
  }

  if (!canInstall) {
    return (
      <p className="text-sm text-gray-400 dark:text-zinc-500 italic">
        Abre esta página en Chrome o Edge y espera unos segundos para instalar.
      </p>
    )
  }

  return (
    <button
      onClick={handleInstall}
      className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-3xl text-sm font-medium transition cursor-pointer"
    >
      {label}
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3v10m0 0-4-4m4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
