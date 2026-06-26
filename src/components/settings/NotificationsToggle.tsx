"use client"

import {
  BellFill,
  BellSlash,
} from "@gravity-ui/icons"
import { Switch } from "@heroui/react"
import { useEffect, useState } from "react"

type PermState = "default" | "granted" | "denied" | "unsupported"

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

async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" })
  } catch (err) {
    console.error("[push] SW register error", err)
    return null
  }
}

async function getExistingSubscription(reg: ServiceWorkerRegistration) {
  return reg.pushManager.getSubscription()
}

export default function NotificationsToggle() {
  const [supported, setSupported] = useState(true)
  const [permission, setPermission] = useState<PermState>("default")
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [testSending, setTestSending] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setSupported(false)
      setPermission("unsupported")
      return
    }
    setPermission((Notification.permission as PermState) || "default")

    ;(async () => {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js").catch(() => null) ?? await registerSW()
      if (!reg) return
      const sub = await getExistingSubscription(reg)
      setSubscribed(!!sub)
    })()

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "push-click" && event.data?.url) {
        try { window.location.href = event.data.url } catch {}
      }
    }
    navigator.serviceWorker.addEventListener?.("message", onMessage)
    return () => navigator.serviceWorker.removeEventListener?.("message", onMessage)
  }, [])

  const isOn = subscribed && permission === "granted"

  async function toggle(next: boolean) {
    setMessage(null)
    if (!supported) {
      setMessage("Tu navegador no soporta notificaciones push.")
      return
    }
    setBusy(true)
    try {
      if (next) {
        const perm = await Notification.requestPermission()
        setPermission(perm as PermState)
        if (perm !== "granted") {
          setMessage("Necesitamos permiso del navegador para enviarte notificaciones.")
          setSubscribed(false)
          return
        }
        const reg = await navigator.serviceWorker.ready
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) {
          setMessage("Falta la clave pública VAPID del servidor.")
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
        if (!res.ok) throw new Error("No se pudo guardar la suscripción")
        setSubscribed(true)
        setMessage("Notificaciones activadas. Recibirás avisos en tiempo real.")
      } else {
        const reg = await navigator.serviceWorker.getRegistration("/sw.js")
        const sub = reg ? await reg.pushManager.getSubscription() : null
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          }).catch(() => {})
          await sub.unsubscribe().catch(() => {})
        }
        setSubscribed(false)
        setMessage("Notificaciones desactivadas.")
      }
    } catch (err: any) {
      console.error(err)
      setMessage(err?.message || "Ocurrió un error con las notificaciones.")
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    setTestSending(true)
    setMessage(null)
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "🔔 EduConecta · Notificación de prueba",
          body: "Si ves esto en tu pantalla, las notificaciones push funcionan.",
          url: "/dashboard",
          tag: "edu-test",
          icon: "/icons/icon-192.png",
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setMessage(`Enviadas: ${json.sent}/${json.total}. Revisa la barra de notificaciones o la pantalla bloqueada.`)
      } else {
        setMessage(json.error || "Error al enviar la prueba")
      }
    } catch (err: any) {
      setMessage(err?.message || "Error de red")
    } finally {
      setTestSending(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 dark:border-zinc-700 p-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex items-center justify-center size-10 rounded-xl shrink-0 transition-colors ${isOn ? "bg-purple-500/15 text-purple-600 dark:text-purple-300" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400"}`}>
            {isOn ? <BellFill className="size-5" /> : <BellSlash className="size-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Notificaciones Push</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Recibe avisos de tareas, comunicados y eventos en este dispositivo, incluso con la pantalla bloqueada.
            </p>
            {!supported && (
              <p className="text-xs text-red-500 mt-1">Tu navegador no soporta notificaciones push.</p>
            )}
            {supported && permission === "denied" && (
              <p className="text-xs text-red-500 mt-1">Has bloqueado las notificaciones. Habilítalas desde los ajustes del navegador.</p>
            )}
          </div>
        </div>
        <Switch
          isSelected={isOn}
          isDisabled={!supported || busy}
          onChange={toggle}
          aria-label="Notificaciones push"
          size="lg"
        >
          {({ isSelected }) => (
            <Switch.Content>
              <Switch.Control className={isSelected ? "bg-purple-500/80" : ""}>
                <Switch.Thumb>
                  <Switch.Icon>
                    {isSelected ? (
                      <BellFill className="size-3 text-inherit opacity-100" />
                    ) : (
                      <BellSlash className="size-3 text-inherit opacity-70" />
                    )}
                  </Switch.Icon>
                </Switch.Thumb>
              </Switch.Control>
            </Switch.Content>
          )}
        </Switch>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={sendTest}
          disabled={!subscribed || testSending}
          className="rounded-[20px] border border-gray-200 dark:border-zinc-700 px-4 py-2 text-xs font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {testSending ? "Enviando…" : "Enviar notificación de prueba"}
        </button>
        <p className="text-[11px] text-gray-400 dark:text-zinc-500">
          Activa el switch, pulsa el botón y bloquea la pantalla del móvil. Debería aparecer la notificación igual que en WhatsApp.
        </p>
      </div>

      {message && (
        <p className="text-xs text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/50 rounded-xl px-3 py-2">
          {message}
        </p>
      )}
    </div>
  )
}