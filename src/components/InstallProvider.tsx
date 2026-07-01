"use client"

import { useEffect, useState } from "react"
import { setDeferredPrompt } from "@/lib/deferred-prompt"

export default function DbProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setReady(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    navigator.serviceWorker?.register("/sw.js")
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  return <>{children}</>
}
