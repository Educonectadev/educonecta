import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query, create } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const courses = await query(
    `SELECT c.*,
      COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ct.id, 'courseId', ct.courseId, 'teacherId', ct.teacherId, 'gradeId', ct.gradeId, 'sectionId', ct.sectionId,
            'teacher', JSON_OBJECT('id', t.id, 'userId', t.userId, 'speciality', t.speciality, 'user', JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email)),
            'grade', CASE WHEN ct.gradeId IS NOT NULL THEN JSON_OBJECT('id', g.id, 'name', g.name) ELSE NULL END,
            'section', CASE WHEN ct.sectionId IS NOT NULL THEN JSON_OBJECT('id', s.id, 'name', s.name) ELSE NULL END
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
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { name, code, description } = body

    if (!name) {
      return NextResponse.json({ error: "Nombre del curso es requerido" }, { status: 400 })
    }

    const existing = await query("SELECT id FROM Course WHERE name = ? AND institutionId = ?", [name, institutionId])
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ya existe un curso con ese nombre en esta institución" }, { status: 409 })
    }

    const insertId = await create("Course", {
      name,
      code: code || null,
      description: description || null,
      institutionId,
    })

    const course = await query("SELECT * FROM Course WHERE id = ?", [insertId])
    return NextResponse.json(course[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear curso" }, { status: 500 })
  }
}
