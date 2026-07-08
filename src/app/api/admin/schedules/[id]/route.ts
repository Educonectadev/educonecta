import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, update, remove } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const scheduleRows = await query("SELECT * FROM Schedule WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (scheduleRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const schedule = scheduleRows[0]

  try {
    const body = await request.json()
    const { dayOfWeek, startTime, endTime, classroom, courseId, shift, teacherId, gradeId, sectionId } = body

    if (courseId) {
      const courseRows = await query("SELECT id FROM Course WHERE id = ? AND institutionId = ?", [courseId, institutionId])
      if (courseRows.length === 0) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    await update("Schedule", { id }, {
      dayOfWeek: dayOfWeek ?? schedule.dayOfWeek,
      startTime: startTime ?? schedule.startTime,
      endTime: endTime ?? schedule.endTime,
      classroom: classroom !== undefined ? classroom : schedule.classroom,
      shift: shift ?? schedule.shift,
      courseId: courseId ?? schedule.courseId,
      teacherId: teacherId !== undefined ? (teacherId || null) : schedule.teacherId,
      gradeId: gradeId !== undefined ? (gradeId || null) : schedule.gradeId,
      sectionId: sectionId !== undefined ? (sectionId || null) : schedule.sectionId,
    })

    try {
      const { broadcastScheduleToTeachers } = await import("@/lib/push-events")
      await broadcastScheduleToTeachers({
        courseId: courseId ?? schedule.courseId,
        institutionId,
        dayOfWeek: dayOfWeek ?? schedule.dayOfWeek,
        startTime: startTime ?? schedule.startTime,
        endTime: endTime ?? schedule.endTime,
        teacherId: teacherId !== undefined ? (teacherId || null) : schedule.teacherId,
      })
    } catch (err) {
      console.error("[schedule push PUT]", err)
    }

    const updated = await query(
      `SELECT s.*,
        jsonb_build_object('id', c.id, 'name', c.name, 'code', c.code) AS course,
        CASE WHEN s.teacherId IS NOT NULL THEN jsonb_build_object('id', t.id, 'userId', t.userId, 'name', u.name, 'speciality', t.speciality) ELSE NULL END AS teacher,
        CASE WHEN s.gradeId IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name) ELSE NULL END AS grade,
        CASE WHEN s.sectionId IS NOT NULL THEN jsonb_build_object('id', sec.id, 'name', sec.name) ELSE NULL END AS section
      FROM Schedule s
      LEFT JOIN Course c ON s.courseId = c.id
      LEFT JOIN Teacher t ON s.teacherId = t.id
      LEFT JOIN User u ON t.userId = u.id
      LEFT JOIN Grade g ON s.gradeId = g.id
      LEFT JOIN Section sec ON s.sectionId = sec.id
      WHERE s.id = ?`,
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

  const scheduleRows = await query("SELECT id FROM Schedule WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (scheduleRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await remove("Schedule", { id })
  return NextResponse.json({ success: true })
}
