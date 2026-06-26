import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"
import { sendPushTo, type StoredSubscription } from "@/lib/web-push"

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { userIds, title, body, url, icon, tag, data } = await req.json()
  if (!title || !body) return NextResponse.json({ error: "title y body son requeridos" }, { status: 400 })

  const targets: number[] = Array.isArray(userIds) && userIds.length > 0
    ? userIds
    : [Number(session.user.id)]

  const supabase = getSupabaseAdmin()
  const { data: subs, error } = await supabase
    .from("PushSubscription")
    .select("endpoint, p256dh, auth")
    .in("userId", targets)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!subs || subs.length === 0) return NextResponse.json({ sent: 0, total: 0 })

  const payload = { title, body, url, icon, tag, data }
  const results = await Promise.all(
    (subs as StoredSubscription[]).map((sub) => sendPushTo(sub, payload)),
  )

  const failed = results
    .map((ok, i) => (ok ? null : (subs as StoredSubscription[])[i].endpoint))
    .filter(Boolean) as string[]

  if (failed.length > 0) {
    await supabase.from("PushSubscription").delete().in("endpoint", failed)
  }

  return NextResponse.json({ sent: results.filter(Boolean).length, total: subs.length, cleaned: failed.length })
}