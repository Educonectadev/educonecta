import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query, execute, update, remove } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const gradeRows = await query("SELECT * FROM Grade WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (gradeRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const grade = gradeRows[0]

  const body = await request.json()
  const { name, level, defaultShift } = body

  if (name && name !== grade.name) {
    const dup = await query("SELECT id FROM Grade WHERE name = ? AND institutionId = ? AND id != ?", [name, institutionId, id])
    if (dup.length > 0) return NextResponse.json({ error: "Ya existe un grado con ese nombre" }, { status: 409 })
  }

  await update("Grade", { id }, {
    name: name ?? grade.name,
    level: level !== undefined ? level : grade.level,
    defaultShift: defaultShift !== undefined ? (defaultShift || null) : grade.defaultShift,
  })

  const updated = await query(
    `SELECT g.*,
      COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT('id', s.id, 'name', s.name, 'gradeId', s.gradeId, 'capacity', s.capacity)
          ORDER BY s.name ASC
        ),
        JSON_ARRAY()
      ) AS sections
    FROM Grade g
    LEFT JOIN Section s ON s.gradeId = g.id
    WHERE g.id = ?
    GROUP BY g.id`,
    [id]
  )
  return NextResponse.json(updated[0])
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const gradeRows = await query("SELECT id FROM Grade WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (gradeRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  try {
    await execute("DELETE FROM Section WHERE gradeId = ?", [id])
    await execute("DELETE FROM Enrollment WHERE gradeId = ?", [id])
    await execute("DELETE FROM CourseTeacher WHERE gradeId = ?", [id])
    await execute("DELETE FROM Homework WHERE gradeId = ?", [id])
    await execute("UPDATE Student SET gradeId = NULL, sectionId = NULL WHERE gradeId = ?", [id])
    await remove("Grade", { id })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar el grado" }, { status: 500 })
  }
}
