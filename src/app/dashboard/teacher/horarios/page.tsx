import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/prisma"
import TeacherHorariosClient from "./TeacherHorariosClient"

export default async function TeacherHorariosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!
  const institutionId = session.user.institutionId!

  const schedulesData = await query<any[]>(
    `SELECT s.*,
      c.id AS c_id, c.name AS c_name,
      t.id AS t_id, u.name AS t_name, t.speciality AS t_speciality,
      g.id AS g_id, g.name AS g_name,
      sec.id AS sec_id, sec.name AS sec_name
    FROM Schedule s
    LEFT JOIN Course c ON c.id = s.courseId
    LEFT JOIN Teacher t ON s.teacherId = t.id
    LEFT JOIN User u ON t.userId = u.id
    LEFT JOIN Grade g ON s.gradeId = g.id
    LEFT JOIN Section sec ON s.sectionId = sec.id
    WHERE s.institutionId = ? AND (s.teacherId = ? OR s.courseId IN (
      SELECT courseId FROM CourseTeacher WHERE teacherId = ?
    ))
    ORDER BY s.dayOfWeek ASC, s.startTime ASC`,
    [institutionId, teacherId, teacherId]
  )

  const schedules = schedulesData.map((s: any) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    classroom: s.classroom,
    shift: s.shift,
    course: { id: s.c_id, name: s.c_name },
    teacher: s.t_id ? { id: s.t_id, name: s.t_name, speciality: s.t_speciality } : null,
    grade: s.g_id ? { id: s.g_id, name: s.g_name } : null,
    section: s.sec_id ? { id: s.sec_id, name: s.sec_name } : null,
  }))

  return <TeacherHorariosClient schedules={schedules} />
}
