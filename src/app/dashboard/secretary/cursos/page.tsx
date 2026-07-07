import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import { findMany, query } from "@/lib/prisma"
import CursosList from "../../admin/cursos/CursosList"

export default async function SecretaryCursosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY") redirect("/login")

  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()

  const [courses, teachers, grades] = await Promise.all([
    findMany<any>("Course", { where: { institutionId }, orderBy: "name", orderDir: "ASC" }),
    supabase.from("Teacher").select("id, user:User(name), speciality").eq("institutionId", institutionId),
    findMany<any>("Grade", { where: { institutionId } }),
  ])

  const courseIds = (courses as any[]).map((c: any) => c.id)
  const gradeIds = (grades as any[]).map((g: any) => g.id)

  const [{ data: courseTeachers }, scheduleCounts, { data: sections }] = await Promise.all([
    courseIds.length
      ? supabase.from("CourseTeacher").select("*, teacher:Teacher(id, user:User(name), speciality), grade:Grade(id, name), section:Section(id, name)").in("courseId", courseIds)
      : Promise.resolve({ data: [] }),
    courseIds.length
      ? query<any>(`SELECT "courseId", COUNT(*)::int AS total FROM "Schedule" WHERE "courseId" IN (${courseIds.map(() => "?").join(",")}) AND "institutionId" = ? GROUP BY "courseId"`, [...courseIds, institutionId])
      : Promise.resolve([]),
    gradeIds.length
      ? supabase.from("Section").select("*").in("gradeId", gradeIds)
      : Promise.resolve({ data: [] }),
  ])

  const coursesList = (courses as any[]).map((c: any) => ({
    ...c,
    teachers: (courseTeachers ?? []).filter((ct: any) => ct.courseId === c.id),
    scheduleCount: Number(((scheduleCounts as any[]) ?? []).find((s: any) => s.courseId === c.id)?.total ?? 0),
  }))

  return (
    <CursosList
      courses={coursesList as any}
      teachers={(teachers.data ?? []).map((t: any) => ({ id: t.id, user: { name: t.user?.name }, speciality: t.speciality })) as any}
      grades={grades as any}
      sections={(sections ?? []) as any}
    />
  )
}
