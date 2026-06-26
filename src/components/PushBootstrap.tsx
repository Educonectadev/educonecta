"use client"

import { useEffect } from "react"

export default function PushBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    if (!("PushManager" in window) || !("Notification" in window)) return
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
      console.warn("[push] SW register failed", err)
    })
  }, [])
  return null
}