import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { findOne, create } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 })
  }

  try {
    const { institutionId, email, password, name } = await req.json()

    if (!institutionId || !email?.trim() || !password?.trim() || !name?.trim()) {
      return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 })
    }

    const institution = await findOne("Institution", { id: institutionId })
    if (!institution) {
      return NextResponse.json({ message: "Institución no encontrada" }, { status: 404 })
    }

    const existingUser = await findOne("User", { email: email.trim() })
    if (existingUser) {
      return NextResponse.json({ message: "El email ya está registrado" }, { status: 409 })
    }

    const supabase = getSupabaseAdmin()
    const { data: existingAuth } = await supabase.auth.admin.listUsers()
    const found = existingAuth?.users?.find((u) => u.email === email.trim())
    if (!found) {
      const { error: authError } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
      })
      if (authError) {
        return NextResponse.json({ message: `Error al crear acceso: ${authError.message}` }, { status: 500 })
      }
    } else {
      await supabase.auth.admin.updateUserById(found.id, { password })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const userId = await create("User", {
      email: email.trim(),
      passwordHash,
      name: name.trim(),
      role: "SECRETARY",
      institutionId,
    } as any)

    await create("Secretary", { userId, institutionId } as any)

    const user = await findOne("User", { id: userId }, ["id", "email", "name", "role"])

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch {
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 })
  }

  const institutionId = Number(req.nextUrl.searchParams.get("institutionId"))
  if (!institutionId) {
    return NextResponse.json({ message: "ID de institución requerido" }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data: secretary } = await supabase
      .from("Secretary")
      .select("userId")
      .eq("institutionId", institutionId)
      .limit(1)
      .maybeSingle()

    if (!secretary) return NextResponse.json(null)

    const user = await findOne("User", { id: (secretary as any).userId, role: "SECRETARY" }, ["id", "email", "name"])
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 })
  }
}
