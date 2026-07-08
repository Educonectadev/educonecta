import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, execute, update, remove } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const courseRows = await query("SELECT * FROM Course WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (courseRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const course = courseRows[0]

  try {
    const body = await request.json()
    const { name, code, description } = body

    if (name && name !== course.name) {
      const dup = await query("SELECT id FROM Course WHERE name = ? AND institutionId = ? AND id != ?", [name, institutionId, id])
      if (dup.length > 0) return NextResponse.json({ error: "Nombre ya existe" }, { status: 409 })
    }

    if (code && code !== course.code) {
      const codeDup = await query("SELECT id FROM Course WHERE code = ? AND institutionId = ? AND id != ?", [code, institutionId, id])
      if (codeDup.length > 0) return NextResponse.json({ error: "Código ya existe" }, { status: 409 })
    }

    await update("Course", { id }, {
      name: name ?? course.name,
      code: code !== undefined ? (code || null) : course.code,
      description: description !== undefined ? (description || null) : course.description,
    })

    const updated = await query(
      `SELECT c.*,
        COALESCE(
          JSON_ARRAYAGG(
            jsonb_build_object(
              'id', ct.id, 'courseId', ct.courseId, 'teacherId', ct.teacherId, 'gradeId', ct.gradeId, 'sectionId', ct.sectionId,
              'teacher', jsonb_build_object('id', t.id, 'userId', t.userId, 'speciality', t.speciality, 'user', jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email)),
              'grade', CASE WHEN ct.gradeId IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name) ELSE NULL END,
              'section', CASE WHEN ct.sectionId IS NOT NULL THEN jsonb_build_object('id', s.id, 'name', s.name) ELSE NULL END
            )
          ),
          JSON_ARRAY()
        ) AS teachers
      FROM Course c
      LEFT JOIN CourseTeacher ct ON ct.courseId = c.id
      LEFT JOIN Teacher t ON ct.teacherId = t.id
      LEFT JOIN User u ON t.userId = u.id
      LEFT JOIN Grade g ON ct.gradeId = g.id
      LEFT JOIN Section s ON ct.sectionId = s.id
      WHERE c.id = ?
      GROUP BY c.id`,
      [id]
    )
    return NextResponse.json(updated[0])
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const courseRows = await query("SELECT id FROM Course WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (courseRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await execute("DELETE FROM Schedule WHERE courseId = ?", [id])
  await execute("DELETE FROM CourseTeacher WHERE courseId = ?", [id])
  await remove("Course", { id })
  return NextResponse.json({ success: true })
}
