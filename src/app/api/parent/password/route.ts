import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSession } from "@/lib/auth"
import { query, update } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const currentPassword = String(body?.currentPassword ?? "")
    const newPassword = String(body?.newPassword ?? "")

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const userId = Number(session.user.id)
    const rows = await query<any[]>(`SELECT "passwordHash" FROM "User" WHERE id = ?`, [userId])
    if (rows.length === 0) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    const ok = await bcrypt.compare(currentPassword, rows[0].passwordHash)
    if (!ok) return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 401 })

    const hash = await bcrypt.hash(newPassword, 10)
    await update("User", { id: userId }, { passwordHash: hash })

    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase")
      const supabase = getSupabaseAdmin()
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const authUser = authUsers.users.find((u) => u.email === session.user.email)
      if (authUser) {
        await supabase.auth.admin.updateUserById(authUser.id, { password: newPassword })
      }
    } catch {}

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[parent/password]", e)
    return NextResponse.json({ error: "Error al cambiar contraseña" }, { status: 500 })
  }
}
