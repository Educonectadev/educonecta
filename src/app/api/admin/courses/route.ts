import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create, remove } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const courses = await query(
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
    WHERE c.institutionId = ?
    GROUP BY c.id
    ORDER BY c.name ASC`,
    [institutionId]
  )

  return NextResponse.json(courses)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    console.log("[admin/courses POST] Datos recibidos:", body)
    const { name, code, description, initialAssignment } = body

    if (!name) {
      return NextResponse.json({ error: "Nombre del curso es requerido" }, { status: 400 })
    }
    if (name.trim().length < 2) {
      return NextResponse.json({ error: "El nombre es muy corto" }, { status: 400 })
    }

    const existing = await query("SELECT id FROM Course WHERE name = ? AND institutionId = ?", [name, institutionId])
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ya existe un curso con ese nombre en esta institución" }, { status: 409 })
    }

    if (code) {
      const codeDup = await query("SELECT id FROM Course WHERE code = ? AND institutionId = ?", [code, institutionId])
      if (codeDup.length > 0) {
        return NextResponse.json({ error: "Ya existe un curso con ese código" }, { status: 409 })
      }
    }

    console.log("[admin/courses POST] Insertando Course")
    const insertId = await create("Course", {
      name,
      code: code || null,
      description: description || null,
      institutionId,
    })
    console.log("[admin/courses POST] Curso creado id:", insertId)

    let createdAssignmentId: number | null = null
    if (initialAssignment?.teacherId) {
      const teacherId = Number(initialAssignment.teacherId)
      const teacherRows = await query("SELECT id FROM Teacher WHERE id = ? AND institutionId = ?", [teacherId, institutionId])
      if (teacherRows.length === 0) {
        await remove("Course", { id: insertId })
        return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 })
      }
      const gradeId = initialAssignment.gradeId ? Number(initialAssignment.gradeId) : null
      const sectionId = initialAssignment.sectionId ? Number(initialAssignment.sectionId) : null
      const dup = await query(
        `SELECT id FROM "CourseTeacher"
         WHERE "courseId" = ?
           AND "teacherId" = ?
           AND "gradeId" IS NOT DISTINCT FROM ?
           AND "sectionId" IS NOT DISTINCT FROM ?`,
        [insertId, teacherId, gradeId, sectionId],
      )
      if (dup.length === 0) {
        console.log("[admin/courses POST] Insertando CourseTeacher", { insertId, teacherId, gradeId, sectionId })
        createdAssignmentId = await create("CourseTeacher", {
          courseId: insertId,
          teacherId,
          gradeId,
          sectionId,
        })
        console.log("[admin/courses POST] CourseTeacher creado id:", createdAssignmentId)
      }
    }

    const course = await query("SELECT * FROM Course WHERE id = ?", [insertId])
    console.log("[admin/courses POST] Curso final:", course[0])
    return NextResponse.json({ ...course[0], initialAssignmentId: createdAssignmentId }, { status: 201 })
  } catch (error) {
    console.error("[admin/courses POST] Error creando curso:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
