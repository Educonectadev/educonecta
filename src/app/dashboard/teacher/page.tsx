import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"

export default async function TeacherDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId
  const institutionId = session.user.institutionId

  let courseTeachers: any[] = []
  let totalStudents = 0
  let activeHomework = 0
  let classesToday = 0
  let error: string | null = null

  try {
    if (!teacherId || !institutionId) {
      throw new Error("No se encontraron datos del profesor")
    }

    const ctData = await query<any[]>(
      "SELECT ct.*, c.id as c_id, c.name as c_name, g.id as g_id, g.name as g_name, sec.id as sec_id, sec.name as sec_name FROM CourseTeacher ct LEFT JOIN Course c ON c.id = ct.courseId LEFT JOIN Grade g ON g.id = ct.gradeId LEFT JOIN Section sec ON sec.id = ct.sectionId WHERE ct.teacherId = ?",
      [teacherId]
    )

    courseTeachers = ctData.map((ct: any) => ({
      id: ct.id,
      courseId: ct.courseId,
      gradeId: ct.gradeId,
      sectionId: ct.sectionId,
      course: { id: ct.c_id, name: ct.c_name },
      grade: ct.g_id ? { id: ct.g_id, name: ct.g_name } : null,
      section: ct.sec_id ? { id: ct.sec_id, name: ct.sec_name } : null,
    }))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const gradeIds: number[] = []
    for (const ct of courseTeachers) {
      if (ct.gradeId != null) gradeIds.push(ct.gradeId)
    }

    if (gradeIds.length > 0) {
      const placeholders = gradeIds.map(() => "?").join(",")
      const r = await query<any[]>(`SELECT COUNT(*) as total FROM Student WHERE institutionId = ? AND isActive = true AND gradeId IN (${placeholders})`, [institutionId, ...gradeIds])
      totalStudents = r[0]?.total ?? 0
    } else {
      const r = await query<any[]>("SELECT COUNT(*) as total FROM Student WHERE institutionId = ? AND isActive = true", [institutionId])
      totalStudents = r[0]?.total ?? 0
    }

    const activeHw = await query<any[]>("SELECT COUNT(*) as total FROM Homework WHERE teacherId = ? AND dueDate >= ?", [teacherId, today])
    activeHomework = activeHw[0]?.total ?? 0

    if (courseTeachers.length > 0) {
      const courseIds = courseTeachers.map((ct: any) => ct.courseId)
      const placeholders = courseIds.map(() => "?").join(",")
      const result = await query<any[]>(
        `SELECT COUNT(*) as total FROM Schedule WHERE institutionId = ? AND dayOfWeek = ? AND courseId IN (${placeholders})`,
        [institutionId, today.getDay(), ...courseIds]
      )
      classesToday = result[0]?.total ?? 0
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Error inesperado"
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-8">
        <span className="material-icons text-5xl text-red-400">error_outline</span>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">Error al cargar el panel</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md">{error}</p>
        <a href="/dashboard/teacher" className="btn-primary px-6 py-2.5 rounded-[30px] text-sm font-medium">
          Reintentar
        </a>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Panel del Profesor</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-emerald-50 border border-emerald-200 rounded-[25px] p-6 hover:bg-emerald-100 transition-all duration-200">
          <p className="text-xs uppercase tracking-widest text-emerald-500">Estudiantes</p>
          <p className="text-3xl font-bold mt-2 text-emerald-900">{totalStudents}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-[25px] p-6 hover:bg-emerald-100 transition-all duration-200">
          <p className="text-xs uppercase tracking-widest text-emerald-500">Tareas Activas</p>
          <p className="text-3xl font-bold mt-2 text-emerald-900">{activeHomework}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-[25px] p-6 hover:bg-emerald-100 transition-all duration-200">
          <p className="text-xs uppercase tracking-widest text-emerald-500">Clases Hoy</p>
          <p className="text-3xl font-bold mt-2 text-emerald-900">{classesToday}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold tracking-tight mb-4">Mis Cursos</h2>
      {courseTeachers.length === 0 ? (
        <p className="text-gray-500 text-sm">No tienes cursos asignados.</p>
      ) : (
        <div className="grid gap-3">
          {courseTeachers.map((ct: any) => (
            <div key={ct.id} className="bg-emerald-50 border border-emerald-200 rounded-[25px] p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-900">{ct.course.name}</p>
                <p className="text-sm text-emerald-500">
                  {ct.grade?.name ?? "—"} / {ct.section?.name ?? "—"}
                </p>
              </div>
              <Link
                href={`/profesor/asistencia/tomar?courseId=${ct.courseId}&gradeId=${ct.gradeId}&sectionId=${ct.sectionId}`}
                className="text-sm text-emerald-500 hover:text-emerald-700 transition-colors"
              >
                Tomar Asistencia →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
