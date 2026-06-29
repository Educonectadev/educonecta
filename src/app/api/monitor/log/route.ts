import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const entry = await req.json()
    const { level, message, context, timestamp, duration } = entry

    await getSupabaseAdmin()
      .from("AuditLog")
      .insert({
        userId: 0,
        action: `monitor:${level}`,
        entity: "system",
        details: JSON.stringify({ message, context, duration, timestamp }),
      })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
