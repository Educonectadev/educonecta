import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"
import { broadcastPushToUsers, type BroadcastOptions } from "@/lib/push-broadcast"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { userEmail, title, body, url, icon, tag, data, type } = await req.json()
    if (!userEmail || !title || !body) {
      return NextResponse.json({ error: "userEmail, title y body son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: users, error } = await supabase
      .from("User")
      .select("id, notification_preferences")
      .eq("email", userEmail)
      .eq("isActive", true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!users || users.length === 0) {
      return NextResponse.json({ sent: 0, total: 0, message: "Usuario no encontrado" })
    }

    if (type) {
      const filtered = users.filter((u: any) => {
        const prefs = u.notification_preferences ?? {}
        return prefs[type] !== false
      })
      if (filtered.length === 0) {
        return NextResponse.json({ sent: 0, total: 0, message: "Usuario tiene notificaciones desactivadas para este tipo" })
      }
    }

    const userIds = users.map((u: any) => u.id)
    const opts: BroadcastOptions = { title, body, url, icon, tag, data, type }

    const result = await broadcastPushToUsers(userIds, opts)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[push/send-customer] error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
