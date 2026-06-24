import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: existingSuper } = await supabase
      .from("User")
      .select("id")
      .eq("role", "SUPER_ADMIN")
      .maybeSingle()

    if (existingSuper) {
      return NextResponse.json(
        { error: "Ya existe un Super Admin registrado" },
        { status: 409 },
      )
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const { error: dbError } = await supabase.from("User").insert({
      email,
      name,
      role: "SUPER_ADMIN",
    })

    if (dbError) {
      if (authData.user?.id) {
        await supabase.auth.admin.deleteUser(authData.user.id)
      }
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
