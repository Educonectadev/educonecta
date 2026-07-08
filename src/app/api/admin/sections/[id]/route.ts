import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, execute, findOne, update, remove } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const id = Number((await params).id)

  const section = await findOne("Section", { id })
  if (!section) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body = await request.json()
  const { name, capacity } = body

  if (name && name !== section.name) {
    const dup = await query("SELECT id FROM Section WHERE name = ? AND gradeId = ? AND id != ?", [name, section.gradeId, id])
    if (dup.length > 0) return NextResponse.json({ error: "Ya existe una sección con ese nombre en este grado" }, { status: 409 })
  }

  await update("Section", { id }, {
    name: name ?? section.name,
    capacity: capacity !== undefined ? (capacity ? Number(capacity) : null) : section.capacity,
  })

  const updated = await findOne("Section", { id })
  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const id = Number((await params).id)

  const section = await findOne("Section", { id })
  if (!section) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  try {
    await execute("UPDATE Student SET sectionId = NULL WHERE sectionId = ?", [id])
    await execute("DELETE FROM Enrollment WHERE sectionId = ?", [id])
    await execute("DELETE FROM CourseTeacher WHERE sectionId = ?", [id])
    await execute("DELETE FROM Homework WHERE sectionId = ?", [id])
    await remove("Section", { id })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar la sección" }, { status: 500 })
  }
}
