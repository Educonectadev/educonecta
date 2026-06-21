import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { findOne, create, query } from "@/lib/prisma"
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

    const passwordHash = await bcrypt.hash(password, 10)

    const userId = await create("User", {
      email: email.trim(),
      passwordHash,
      name: name.trim(),
      role: "INSTITUTIONAL_ADMIN",
      institutionId,
    } as any)

    await create("InstitutionalAdmin", {
      userId,
      institutionId,
    } as any)

    const user = await findOne("User", { id: userId }, ["id", "email", "name", "role"])

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    const mysqlError = error as { code?: string }
    return NextResponse.json(
      { message: mysqlError.code === "ER_DUP_ENTRY" ? "El email ya está registrado" : "Error interno del servidor" },
      { status: 500 },
    )
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
    const rows = await query<any[]>(
      `SELECT u.id, u.email, u.name, u.phone, u.isActive
       FROM User u
       INNER JOIN InstitutionalAdmin ia ON ia.userId = u.id
       WHERE ia.institutionId = ? AND u.role = 'INSTITUTIONAL_ADMIN'
       LIMIT 1`,
      [institutionId],
    )

    return NextResponse.json(rows.length ? rows[0] : null)
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 })
  }
}
