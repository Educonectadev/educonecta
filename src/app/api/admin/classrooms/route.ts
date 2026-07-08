import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!

  const classrooms = await query(
    "SELECT * FROM Classroom WHERE institutionId = ? ORDER BY name ASC",
    [institutionId]
  )

  return NextResponse.json(classrooms)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { name, code, capacity, location } = body

    if (!name) {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 })
    }

    const insertId = await create("Classroom", {
      name,
      code: code || null,
      capacity: capacity ? Number(capacity) : null,
      location: location || null,
      institutionId,
    })

    const classroom = await query("SELECT * FROM Classroom WHERE id = ?", [insertId])
    return NextResponse.json(classroom[0], { status: 201 })
  } catch (err: unknown) {
    const msg = (err as { code?: string })?.code === "ER_DUP_ENTRY"
      ? "Ya existe un aula con ese nombre"
      : "Error al crear aula"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
