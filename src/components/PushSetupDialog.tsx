"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-context"

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i)
  return output
}

function asArrayBuffer(u: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(u.byteLength)
  new Uint8Array(buf).set(u)
  return buf
}

type Step = "explain" | "requesting" | "success" | "error" | "unsupported" | "denied" | "done"

const DISMISS_KEY = "ec-push-dismissed"

export default function PushSetupDialog() {
  const { status } = useSession()
  const [step, setStep] = useState<Step>("explain")
  const [initialized, setInitialized] = useState(false)

  if (status !== "authenticated") return null

  useEffect(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem(DISMISS_KEY)) {
      setStep("done")
      setInitialized(true)
      return
    }
    const unsupported =
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    if (unsupported) {
      setStep("unsupported")
      setInitialized(true)
      return
    }
    if (Notification.permission === "denied") {
      setStep("denied")
      setInitialized(true)
      return
    }
    ;(async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration("/sw.js")
        if (reg) {
          const sub = await reg.pushManager.getSubscription()
          if (sub) {
            setStep("done")
            localStorage.setItem(DISMISS_KEY, "true")
          }
        }
      } catch {}
      setInitialized(true)
    })()
  }, [])

  async function handleActivate() {
    setStep("requesting")
    try {
      const perm = await Notification.requestPermission()
      if (perm !== "granted") {
        setStep("denied")
        return
      }
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setStep("error")
        return
      }
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: asArrayBuffer(urlBase64ToUint8Array(vapidKey)),
        })
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })
      if (!res.ok) throw new Error("Error al guardar")
      setStep("success")
      localStorage.setItem(DISMISS_KEY, "true")
    } catch {
      setStep("error")
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "true")
    setStep("done")
  }

  if (step === "done" || !initialized) return null

  return (
    <div className="fixed bottom-40 left-4 right-4 z-50 mx-auto max-w-sm animate-fade-in">
      <div className="sa-surface p-5 space-y-4">
        {step === "explain" && (
          <>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Recibe notificaciones al instante</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Actívalas para enterarte al instante de tareas nuevas, mensajes, calificaciones y comunicados importantes, incluso con la pantalla bloqueada.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleActivate} className="sa-btn sa-btn-primary flex-1 text-sm py-2.5">
                Activar notificaciones
              </button>
              <button onClick={dismiss} className="sa-btn sa-btn-ghost text-sm py-2.5">
                Ahora no
              </button>
            </div>
          </>
        )}

        {step === "requesting" && (
          <div className="flex items-center gap-3 py-2">
            <svg className="animate-spin size-5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p className="text-sm text-foreground">Configurando notificaciones...</p>
          </div>
        )}

        {step === "success" && (
          <>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-green-500/15 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Notificaciones activadas</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recibirás avisos en tiempo real. Puedes configurar los tipos de notificación desde Ajustes.
                </p>
              </div>
            </div>
            <button onClick={dismiss} className="sa-btn sa-btn-primary w-full text-sm py-2.5">
              Listo
            </button>
          </>
        )}

        {step === "error" && (
          <>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-red-500/15 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Algo salió mal</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No pudimos configurar las notificaciones. Puedes intentarlo más tarde desde Ajustes.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleActivate} className="sa-btn sa-btn-primary flex-1 text-sm py-2.5">
                Reintentar
              </button>
              <button onClick={dismiss} className="sa-btn sa-btn-ghost text-sm py-2.5">
                Cerrar
              </button>
            </div>
          </>
        )}

        {step === "denied" && (
          <>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Permiso denegado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Para activarlas, habilita las notificaciones desde los ajustes del navegador. Luego puedes activarlas desde Ajustes.
                </p>
              </div>
            </div>
            <button onClick={dismiss} className="sa-btn sa-btn-ghost w-full text-sm py-2.5">
              Entendido
            </button>
          </>
        )}

        {step === "unsupported" && (
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-surface-3 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">No disponible</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tu navegador no soporta notificaciones push. Intenta con Chrome, Edge o Safari.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
