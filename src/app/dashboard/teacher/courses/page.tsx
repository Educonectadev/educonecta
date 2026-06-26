import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"
import TeacherCoursesClient from "./TeacherCoursesClient"

interface CourseTeacherRow {
  id: number
  courseId: number
  teacherId: number
  gradeId: number | null
  sectionId: number | null
  course: { id: number; name: string; code: string | null } | null
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

interface ScheduleRow {
  id: number
  courseId: number
  gradeId: number | null
  sectionId: number | null
  dayOfWeek: number
  startTime: string
  endTime: string
  classroom: string | null
}

interface HomeworkRow {
  id: number
  title: string
  courseId: number
  gradeId: number | null
  sectionId: number | null
  dueDate: string
  createdAt: string
}

interface StudentRow {
  id: number
  firstName: string
  lastName: string
  gradeId: number | null
  sectionId: number | null
  isActive: boolean
}

type QueryResult<T> = { data: T[] | null; error: { message: string } | null }
const emptyResult = <T,>(): QueryResult<T> => ({ data: [], error: null })

export default async function TeacherCoursesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!
  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()

  const { data: courseTeachers, error } = await supabase
    .from("CourseTeacher")
    .select("id, courseId, teacherId, gradeId, sectionId, course:Course(id, name, code), grade:Grade(id, name), section:Section(id, name)")
    .eq("teacherId", teacherId)
    .order("id", { ascending: false })

  if (error) {
    return (
      <div className="p-6 text-sm text-red-500">Error al cargar cursos: {error.message}</div>
    )
  }

  const items = (courseTeachers ?? []) as unknown as CourseTeacherRow[]

  const courseIds = Array.from(new Set(items.map((c) => c.courseId).filter(Boolean)))
  const gradeIds = Array.from(new Set(items.map((c) => c.gradeId).filter(Boolean))) as number[]
  const sectionIds = Array.from(new Set(items.map((c) => c.sectionId).filter(Boolean))) as number[]

  const [schedulesRes, homeworkRes, studentsRes] = await Promise.all([
    courseIds.length > 0
      ? supabase
          .from("Schedule")
          .select("id, courseId, gradeId, sectionId, dayOfWeek, startTime, endTime, classroom")
          .in("courseId", courseIds)
          .order("dayOfWeek")
          .order("startTime")
      : Promise.resolve(emptyResult<ScheduleRow>()),
    courseIds.length > 0
      ? supabase
          .from("Homework")
          .select("id, title, courseId, gradeId, sectionId, dueDate, createdAt")
          .in("courseId", courseIds)
          .order("dueDate", { ascending: false })
          .limit(20)
      : Promise.resolve(emptyResult<HomeworkRow>()),
    sectionIds.length > 0 || gradeIds.length > 0
      ? supabase
          .from("Student")
          .select("id, firstName, lastName, gradeId, sectionId, isActive")
          .eq("institutionId", institutionId)
          .eq("isActive", true)
      : Promise.resolve(emptyResult<StudentRow>()),
  ])

  const schedules = (schedulesRes.data ?? []) as ScheduleRow[]
  const homework = (homeworkRes.data ?? []) as HomeworkRow[]
  const students = (studentsRes.data ?? []) as StudentRow[]

  const studentCountByKey: Record<string, number> = {}
  for (const s of students) {
    if (!s.gradeId && !s.sectionId) continue
    const key = `${s.gradeId ?? "x"}-${s.sectionId ?? "x"}`
    studentCountByKey[key] = (studentCountByKey[key] ?? 0) + 1
  }

  return (
    <TeacherCoursesClient
      items={items}
      schedules={schedules}
      homework={homework}
      studentCountByKey={studentCountByKey}
    />
  )
}
