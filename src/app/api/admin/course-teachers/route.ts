import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create, remove } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { courseId, teacherId, gradeId, sectionId } = body

    if (!courseId || !teacherId) {
      return NextResponse.json({ error: "Curso y profesor requeridos" }, { status: 400 })
    }

    const courseRows = await query("SELECT id FROM Course WHERE id = ? AND institutionId = ?", [courseId, institutionId])
    if (courseRows.length === 0) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

    const teacherRows = await query("SELECT id FROM Teacher WHERE id = ? AND institutionId = ?", [teacherId, institutionId])
    if (teacherRows.length === 0) return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 })

    const existing = await query(
      `SELECT id FROM "CourseTeacher"
       WHERE "courseId" = ?
         AND "teacherId" = ?
         AND "gradeId" IS NOT DISTINCT FROM ?
         AND "sectionId" IS NOT DISTINCT FROM ?`,
      [courseId, teacherId, gradeId ?? null, sectionId ?? null]
    )
    if (existing.length > 0) {
      return NextResponse.json({ error: "Asignación ya existe" }, { status: 409 })
    }

    const insertId = await create("CourseTeacher", {
      courseId,
      teacherId,
      gradeId: gradeId ?? null,
      sectionId: sectionId ?? null,
    })

    const ct = await query(
      `SELECT ct.*,
        jsonb_build_object('id', t.id, 'userId', t.userId, 'speciality', t.speciality, 'user', jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email)) AS teacher,
        CASE WHEN ct.gradeId IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name) ELSE NULL END AS grade,
        CASE WHEN ct.sectionId IS NOT NULL THEN jsonb_build_object('id', s.id, 'name', s.name) ELSE NULL END AS section
      FROM CourseTeacher ct
      LEFT JOIN Teacher t ON ct.teacherId = t.id
      LEFT JOIN User u ON t.userId = u.id
      LEFT JOIN Grade g ON ct.gradeId = g.id
      LEFT JOIN Section s ON ct.sectionId = s.id
      WHERE ct.id = ?`,
      [insertId]
    )
    return NextResponse.json(ct[0], { status: 201 })
  } catch (error) {
    console.error("[admin/course-teachers POST] error:", error)
    return NextResponse.json(
      {
        error: "Error al asignar",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    const ct = await query(
      `SELECT ct.id FROM "CourseTeacher" ct JOIN "Course" c ON ct."courseId" = c.id WHERE ct.id = ? AND c."institutionId" = ?`,
      [id, institutionId]
    )
    if (ct.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    await remove("CourseTeacher", { id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin/course-teachers DELETE] error:", error)
    return NextResponse.json(
      {
        error: "Error al eliminar",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
