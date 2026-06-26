import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"
import { sendPushTo, type StoredSubscription } from "@/lib/web-push"

export async function POST(req: Request) {
  try {
    console.log("[push/send] POST recibido")
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    console.log("[push/send] Usuario:", session.user?.id, session.user?.email)

    const { userIds, title, body, url, icon, tag, data } = await req.json()
    if (!title || !body) return NextResponse.json({ error: "title y body son requeridos" }, { status: 400 })

    const targets: number[] = Array.isArray(userIds) && userIds.length > 0
      ? userIds.map(Number)
      : [Number(session.user.id)]

    console.log("[push/send] Targets:", targets)

    const supabase = getSupabaseAdmin()
    const { data: subs, error } = await supabase
      .from("PushSubscription")
      .select("endpoint, p256dh, auth, userId")
      .in("userId", targets)
    console.log("[push/send] Suscripciones encontradas:", subs?.length ?? 0, subs)

    if (error) {
      console.error("[push/send] Error SELECT:", error)
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 },
      )
    }
    if (!subs || subs.length === 0) {
      return NextResponse.json({
        sent: 0,
        total: 0,
        message: "No hay dispositivos suscritos.",
      })
    }

    const payload = { title, body, url, icon, tag, data }
    const results = await Promise.all(
      (subs as StoredSubscription[]).map((sub) => sendPushTo(sub, payload)),
    )
    console.log("[push/send] Resultados:", results)

    const failed = results
      .map((ok, i) => (ok ? null : (subs as StoredSubscription[])[i].endpoint))
      .filter(Boolean) as string[]

    if (failed.length > 0) {
      await supabase.from("PushSubscription").delete().in("endpoint", failed)
    }

    return NextResponse.json({ sent: results.filter(Boolean).length, total: subs.length, cleaned: failed.length })
  } catch (error) {
    console.error("[push/send] Excepción:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}