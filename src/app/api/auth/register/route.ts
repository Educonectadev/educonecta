import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { hashPassword } from "@/lib/auth"

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

    const { data: existingAuth } = await supabase.auth.admin.listUsers()
    const found = existingAuth?.users?.find((u) => u.email === email)

    if (!found) {
      const { error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    } else {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        found.id,
        { password },
      )
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
    }

    const passwordHash = await hashPassword(password)

    const { error: dbError } = await supabase.from("User").upsert(
      { email, passwordhash: passwordHash, name, role: "SUPER_ADMIN" },
      { onConflict: "email", ignoreDuplicates: false },
    )

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
