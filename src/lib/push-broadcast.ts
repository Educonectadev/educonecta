import { getSupabaseAdmin } from "./supabase"
import { sendPushTo, type StoredSubscription, type PushPayload } from "./web-push"

export interface BroadcastOptions {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
  data?: Record<string, unknown>
}

/**
 * Envía una notificación push a todos los dispositivos suscritos
 * de los userIds indicados. Limpia automáticamente suscripciones
 * inválidas (404/410).
 */
export async function broadcastPushToUsers(userIds: number[], opts: BroadcastOptions) {
  if (!Array.isArray(userIds) || userIds.length === 0) return { sent: 0, total: 0 }
  try {
    const supabase = getSupabaseAdmin()
    const { data: subs, error } = await supabase
      .from("PushSubscription")
      .select("endpoint, p256dh, auth")
      .in("userId", userIds)
    if (error || !subs || subs.length === 0) return { sent: 0, total: 0 }

    const payload: PushPayload = {
      title: opts.title,
      body: opts.body,
      url: opts.url,
      icon: opts.icon ?? "/icons/icon-192.png",
      tag: opts.tag,
      data: opts.data,
    }

    const results = await Promise.all(
      (subs as StoredSubscription[]).map((sub) => sendPushTo(sub, payload)),
    )

    const failed = results
      .map((ok, i) => (ok ? null : (subs as StoredSubscription[])[i].endpoint))
      .filter(Boolean) as string[]

    if (failed.length > 0) {
      await supabase.from("PushSubscription").delete().in("endpoint", failed)
    }

    return { sent: results.filter(Boolean).length, total: subs.length, cleaned: failed.length }
  } catch (err) {
    console.error("[broadcastPushToUsers] error", err)
    return { sent: 0, total: 0 }
  }
}