import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { getServerSession } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email y password requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: existingAuth } = await supabase.auth.admin.listUsers()
    const found = existingAuth?.users?.find((u) => u.email === email)

    if (found) {
      const { error } = await supabase.auth.admin.updateUserById(found.id, { password })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ message: "Contraseña actualizada en Auth", id: found.id })
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: "Usuario creado en Auth", id: data.user.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
