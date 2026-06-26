import webpush from "web-push"

let configured = false

function ensureConfigured() {
  if (configured) return
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@educonecta.dev"
  if (!pub || !priv) {
    throw new Error("Faltan claves VAPID en el servidor (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)")
  }
  webpush.setVapidDetails(subject, pub, priv)
  configured = true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
  tag?: string
  data?: Record<string, unknown>
}

export interface StoredSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

export async function sendPushTo(sub: StoredSubscription, payload: PushPayload): Promise<boolean> {
  ensureConfigured()
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 },
    )
    return true
  } catch (err) {
    const e = err as { statusCode?: number; message?: string }
    if (e?.statusCode === 404 || e?.statusCode === 410) {
      return false
    }
    console.error("[web-push] send error", e?.statusCode, e?.message)
    return false
  }
}

export function getVapidPublicKey(): string {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!pub) throw new Error("Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY")
  return pub
}