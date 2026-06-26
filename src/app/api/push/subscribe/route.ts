import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const subscription = body?.subscription
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from("PushSubscription").upsert(
    {
      userId: Number(session.user.id),
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: req.headers.get("user-agent") ?? null,
    },
    { onConflict: "endpoint" },
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const endpoint = body?.endpoint
  if (!endpoint) return NextResponse.json({ error: "Falta endpoint" }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("PushSubscription")
    .delete()
    .eq("userId", Number(session.user.id))
    .eq("endpoint", endpoint)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("PushSubscription")
    .select("endpoint, userAgent, createdAt")
    .eq("userId", Number(session.user.id))
    .order("createdAt", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ subscriptions: data ?? [] })
}