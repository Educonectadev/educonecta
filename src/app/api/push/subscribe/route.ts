import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    console.log("[push/subscribe] POST recibido")
    const session = await getServerSession()
    if (!session) {
      console.warn("[push/subscribe] Sin sesión")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    console.log("[push/subscribe] Usuario:", session.user?.id, session.user?.email)

    const body = await req.json()
    console.log("[push/subscribe] Body keys:", Object.keys(body ?? {}))
    const subscription = body?.subscription
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      console.warn("[push/subscribe] Suscripción inválida:", {
        hasEndpoint: !!subscription?.endpoint,
        hasP256dh: !!subscription?.keys?.p256dh,
        hasAuth: !!subscription?.keys?.auth,
      })
      return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const userId = Number(session.user.id)
    const userAgent = req.headers.get("user-agent") ?? null

    console.log("[push/subscribe] Upsert en PushSubscription, userId:", userId)
    const { error: upsertError } = await supabase.from("PushSubscription").upsert(
      {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      },
      { onConflict: "endpoint", ignoreDuplicates: false },
    )

    if (upsertError) {
      console.error("[push/subscribe] Error Supabase upsert:", {
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
        code: upsertError.code,
      })
      return NextResponse.json(
        { error: upsertError.message, code: upsertError.code, details: upsertError.details, hint: upsertError.hint },
        { status: 500 },
      )
    }

    const { count } = await supabase
      .from("PushSubscription")
      .select("id", { count: "exact", head: true })
      .eq("userId", userId)

    if (count && count > 5) {
      const { data: old } = await supabase
        .from("PushSubscription")
        .select("id, endpoint")
        .eq("userId", userId)
        .order("createdAt", { ascending: true })
        .limit(count - 5)

      if (old && old.length > 0) {
        const ids = old.map((r: any) => r.id)
        await supabase.from("PushSubscription").delete().in("id", ids)
        console.log("[push/subscribe] Limpiadas suscripciones antiguas:", ids.length)
      }
    }

    console.log("[push/subscribe] OK, userId:", userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[push/subscribe] Excepción:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  try {
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

    if (error) {
      console.error("[push/subscribe] DELETE error:", error)
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 },
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[push/subscribe] DELETE excepción:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("PushSubscription")
      .select("endpoint, userAgent, createdAt")
      .eq("userId", Number(session.user.id))
      .order("createdAt", { ascending: false })

    if (error) {
      console.error("[push/subscribe] GET error:", error)
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 },
      )
    }
    return NextResponse.json({ subscriptions: data ?? [] })
  } catch (error) {
    console.error("[push/subscribe] GET excepción:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}