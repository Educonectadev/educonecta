import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import { findMany } from "@/lib/prisma"
import CursosList from "./CursosList"

export default async function CursosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()

  const [courses, teachersData, grades] = await Promise.all([
    findMany<any>("Course", {
      where: { institutionId },
      orderBy: "name",
      orderDir: "ASC",
    }),
    supabase
      .from("Teacher")
      .select("id, user:User(name)")
      .eq("institutionid", institutionId)
      .then(({ data, error }) => {
        if (error) throw error
        return data ?? []
      }),
    findMany<any>("Grade", { where: { institutionId } }),
  ])

  const courseIds = courses.map((c: any) => c.id)

  const [courseTeachersData, sections] = await Promise.all([
    courseIds.length > 0
      ? supabase
          .from("CourseTeacher")
          .select("*, teacher:Teacher(id, user:User(name)), grade:Grade(id, name), section:Section(id, name)")
          .in("courseid", courseIds)
          .then(({ data, error }) => {
            if (error) throw error
            return data ?? []
          })
      : [],
    (async () => {
      if (grades.length === 0) return []
      const gradeIds = grades.map((g: any) => g.id)
      const { data, error } = await supabase
        .from("Section")
        .select("*")
        .in("gradeid", gradeIds)
      if (error) throw error
      return data ?? []
    })(),
  ])

  const courseMap = new Map<number, any>()
  for (const course of courses) {
    courseMap.set(course.id, {
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description,
      teachers: [],
    })
  }
  for (const ct of courseTeachersData) {
    const course = courseMap.get(ct.courseId)
    if (course) {
      course.teachers.push({
        id: ct.id,
        teacher: ct.teacher,
        grade: ct.grade,
        section: ct.section,
      })
    }
  }
  const coursesList = Array.from(courseMap.values())
  const teachers = teachersData.map((t: any) => ({ id: t.id, user: { name: t.user.name } }))

  return <CursosList courses={coursesList as any} teachers={teachers as any} grades={grades as any} sections={sections as any} />
}
