import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await getSupabaseAdmin()
    .from("User")
    .select("brandColor")
    .eq("id", Number(session.user.id))
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ brandColor: data?.brandColor ?? "#000000" })
}

export async function PUT(req: Request) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { brandColor } = await req.json()

  if (!brandColor || typeof brandColor !== "string") {
    return NextResponse.json({ error: "Color inválido" }, { status: 400 })
  }

  const { error } = await getSupabaseAdmin()
    .from("User")
    .update({ brandColor } as any)
    .eq("id", Number(session.user.id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
