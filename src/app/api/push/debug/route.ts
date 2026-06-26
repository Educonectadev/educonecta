import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("PushSubscription")
    .select("id, userId, endpoint, userAgent, createdAt")
    .order("createdAt", { ascending: false })

  if (error) {
    console.error("[push/debug] error:", error)
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: 500 },
    )
  }

  return NextResponse.json({
    total: data?.length ?? 0,
    subscriptions: data ?? [],
  })
}