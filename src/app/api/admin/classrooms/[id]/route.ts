import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query, update, remove } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const rows = await query("SELECT * FROM Classroom WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (rows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const classroom = rows[0]

  try {
    const body = await request.json()
    const { name, code, capacity, location } = body

    await update("Classroom", { id }, {
      name: name ?? classroom.name,
      code: code !== undefined ? code : classroom.code,
      capacity: capacity !== undefined ? Number(capacity) : classroom.capacity,
      location: location !== undefined ? location : classroom.location,
    })

    const updated = await query("SELECT * FROM Classroom WHERE id = ?", [id])
    return NextResponse.json(updated[0])
  } catch (err: unknown) {
    const msg = (err as { code?: string })?.code === "ER_DUP_ENTRY"
      ? "Ya existe un aula con ese nombre"
      : "Error al actualizar aula"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const rows = await query("SELECT id FROM Classroom WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (rows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await remove("Classroom", { id })
  return NextResponse.json({ success: true })
}
