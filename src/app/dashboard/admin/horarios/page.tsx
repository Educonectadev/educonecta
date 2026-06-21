import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query, findMany } from "@/lib/prisma"
import HorariosList from "./HorariosList"

export default async function HorariosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const [schedulesData, courses, classrooms, teachers, grades, sections, studentsWithParents] = await Promise.all([
    query<any[]>(
      `SELECT s.*, c.id as c_id, c.name as c_name,
        t.id as t_id, u.name as t_name, t.speciality as t_speciality,
        g.id as g_id, g.name as g_name,
        sec.id as sec_id, sec.name as sec_name
      FROM Schedule s
      LEFT JOIN Course c ON c.id = s.courseId
      LEFT JOIN Teacher t ON s.teacherId = t.id
      LEFT JOIN User u ON t.userId = u.id
      LEFT JOIN Grade g ON s.gradeId = g.id
      LEFT JOIN Section sec ON s.sectionId = sec.id
      WHERE s.institutionId = ?
      ORDER BY s.dayOfWeek ASC, s.startTime ASC`,
      [institutionId]
    ),
    findMany("Course", { where: { institutionId }, orderBy: "name" }) as Promise<any[]>,
    findMany("Classroom", { where: { institutionId }, orderBy: "name" }) as Promise<any[]>,
    query<any[]>("SELECT t.id, t.userId, u.name, t.speciality FROM Teacher t LEFT JOIN User u ON t.userId = u.id WHERE t.institutionId = ? ORDER BY u.name", [institutionId]),
    findMany("Grade", { where: { institutionId }, orderBy: "name" }) as Promise<any[]>,
    query<any[]>("SELECT sec.id, sec.name, sec.gradeId FROM Section sec WHERE sec.gradeId IN (SELECT id FROM Grade WHERE institutionId = ?) ORDER BY sec.name", [institutionId]),
    query<any[]>(
      `SELECT s.id AS studentId, s.firstName, s.lastName, s.gradeId, s.sectionId,
              p.id AS parentId, p2.name AS parentName
       FROM Student s
       LEFT JOIN ParentStudent ps ON ps.studentId = s.id
       LEFT JOIN Parent p ON p.id = ps.parentId
       LEFT JOIN User p2 ON p.userId = p2.id
       WHERE s.institutionId = ? AND s.isActive = 1
       ORDER BY s.lastName, s.firstName`,
      [institutionId]
    ),
  ])

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

  return <HorariosList schedules={schedules} courses={courses} classrooms={classrooms} teachers={teachers} grades={grades} sections={sections} studentsWithParents={studentsWithParents} />
}
