import { getSupabaseAdmin } from "./supabase"
import { sendPushTo, type StoredSubscription, type PushPayload } from "./web-push"

export interface BroadcastOptions {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
  data?: Record<string, unknown>
  type?: string
}

/**
 * Envía una notificación push a todos los dispositivos suscritos
 * de los userIds indicados. Limpia automáticamente suscripciones
 * inválidas (404/410).
 * Si se especifica un type, filtra por notification_preferences del usuario.
 */
export async function broadcastPushToUsers(userIds: number[], opts: BroadcastOptions) {
  if (!Array.isArray(userIds) || userIds.length === 0) return { sent: 0, total: 0 }
  try {
    const supabase = getSupabaseAdmin()

    let targetIds = userIds

    if (opts.type) {
      const { data: users } = await supabase
        .from("User")
        .select("id, notification_preferences")
        .in("id", userIds)

      if (users) {
        targetIds = users
          .filter((u: any) => {
            const prefs = u.notification_preferences ?? {}
            return prefs[opts.type!] !== false
          })
          .map((u: any) => u.id)
      }
    }

    if (targetIds.length === 0) return { sent: 0, total: 0 }

    const { data: subs, error } = await supabase
      .from("PushSubscription")
      .select("endpoint, p256dh, auth")
      .in("userId", targetIds)

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

    const sent = results.filter(Boolean).length

    if (sent > 0 && opts.type) {
      const logRows = targetIds.map((userId) => ({
        userId,
        title: opts.title,
        body: opts.body,
        type: opts.type!,
        data: opts.data ?? null,
        sent: true,
        sentAt: new Date().toISOString(),
      }))
      try { await supabase.from("NotificationQueue").insert(logRows).select() } catch {}
    }

    return { sent, total: subs.length, cleaned: failed.length }
  } catch (err) {
    console.error("[broadcastPushToUsers] error", err)
    return { sent: 0, total: 0 }
  }
}
