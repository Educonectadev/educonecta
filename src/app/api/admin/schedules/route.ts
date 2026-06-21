import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const schedules = await query(
    `SELECT s.*,
      JSON_OBJECT('id', c.id, 'name', c.name, 'code', c.code) AS course,
      CASE WHEN s.teacherId IS NOT NULL THEN JSON_OBJECT('id', t.id, 'userId', t.userId, 'name', u.name, 'speciality', t.speciality) ELSE NULL END AS teacher,
      CASE WHEN s.gradeId IS NOT NULL THEN JSON_OBJECT('id', g.id, 'name', g.name) ELSE NULL END AS grade,
      CASE WHEN s.sectionId IS NOT NULL THEN JSON_OBJECT('id', sec.id, 'name', sec.name) ELSE NULL END AS section
    FROM Schedule s
    LEFT JOIN Course c ON s.courseId = c.id
    LEFT JOIN Teacher t ON s.teacherId = t.id
    LEFT JOIN User u ON t.userId = u.id
    LEFT JOIN Grade g ON s.gradeId = g.id
    LEFT JOIN Section sec ON s.sectionId = sec.id
    WHERE s.institutionId = ?
    ORDER BY s.dayOfWeek ASC, s.startTime ASC`,
    [institutionId]
  )

  return NextResponse.json(schedules)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { dayOfWeek, startTime, endTime, classroom, courseId, shift, teacherId, gradeId, sectionId } = body

    if (dayOfWeek == null || !startTime || !endTime || !courseId) {
      return NextResponse.json({ error: "Día, inicio, fin y curso son requeridos" }, { status: 400 })
    }

    const courseRows = await query("SELECT id FROM Course WHERE id = ? AND institutionId = ?", [courseId, institutionId])
    if (courseRows.length === 0) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    const insertId = await create("Schedule", {
      dayOfWeek,
      startTime,
      endTime,
      classroom: classroom || null,
      shift: shift || "MAÑANA",
      courseId,
      teacherId: teacherId || null,
      gradeId: gradeId || null,
      sectionId: sectionId || null,
      institutionId,
    })

    const schedule = await query(
      `SELECT s.*,
        JSON_OBJECT('id', c.id, 'name', c.name, 'code', c.code) AS course,
        CASE WHEN s.teacherId IS NOT NULL THEN JSON_OBJECT('id', t.id, 'userId', t.userId, 'name', u.name, 'speciality', t.speciality) ELSE NULL END AS teacher,
        CASE WHEN s.gradeId IS NOT NULL THEN JSON_OBJECT('id', g.id, 'name', g.name) ELSE NULL END AS grade,
        CASE WHEN s.sectionId IS NOT NULL THEN JSON_OBJECT('id', sec.id, 'name', sec.name) ELSE NULL END AS section
      FROM Schedule s
      LEFT JOIN Course c ON s.courseId = c.id
      LEFT JOIN Teacher t ON s.teacherId = t.id
      LEFT JOIN User u ON t.userId = u.id
      LEFT JOIN Grade g ON s.gradeId = g.id
      LEFT JOIN Section sec ON s.sectionId = sec.id
      WHERE s.id = ?`,
      [insertId]
    )

    return NextResponse.json(schedule[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear horario" }, { status: 500 })
  }
}
