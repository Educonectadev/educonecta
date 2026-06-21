import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import CursosList from "./CursosList"

export default async function CursosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const [coursesRaw, teachersData, grades, sections] = await Promise.all([
    query<any[]>(
      `SELECT c.id, c.name, c.code, c.description,
        ct.id as ct_id,
        t.id as t_id,
        u.name as u_name,
        g.id as g_id, g.name as g_name,
        sec.id as sec_id, sec.name as sec_name
      FROM Course c
      LEFT JOIN CourseTeacher ct ON ct.courseId = c.id
      LEFT JOIN Teacher t ON t.id = ct.teacherId
      LEFT JOIN User u ON u.id = t.userId
      LEFT JOIN Grade g ON g.id = ct.gradeId
      LEFT JOIN Section sec ON sec.id = ct.sectionId
      WHERE c.institutionId = ?
      ORDER BY c.name ASC, ct.id ASC`,
      [institutionId]
    ),
    query<any[]>(
      "SELECT t.id, u.name as userName FROM Teacher t LEFT JOIN User u ON u.id = t.userId WHERE t.institutionId = ?",
      [institutionId]
    ),
    query<any[]>(
      "SELECT * FROM Grade WHERE institutionId = ?",
      [institutionId]
    ),
    query<any[]>(
      "SELECT sec.* FROM Section sec JOIN Grade g ON g.id = sec.gradeId WHERE g.institutionId = ?",
      [institutionId]
    ),
  ])

  const courseMap = new Map<number, any>()
  for (const row of coursesRaw) {
    if (!courseMap.has(row.id)) {
      courseMap.set(row.id, { id: row.id, name: row.name, code: row.code, description: row.description, teachers: [] })
    }
    const course = courseMap.get(row.id)!
    if (row.ct_id) {
      if (!course.teachers.some((ct: any) => ct.id === row.ct_id)) {
        course.teachers.push({
          id: row.ct_id,
          teacher: { id: row.t_id, user: { name: row.u_name } },
          grade: row.g_id ? { id: row.g_id, name: row.g_name } : null,
          section: row.sec_id ? { id: row.sec_id, name: row.sec_name } : null,
        })
      }
    }
  }
  const courses = Array.from(courseMap.values())

  const teachers = teachersData.map((t: any) => ({ id: t.id, user: { name: t.userName } }))

  return <CursosList courses={courses} teachers={teachers} grades={grades} sections={sections} />
}
