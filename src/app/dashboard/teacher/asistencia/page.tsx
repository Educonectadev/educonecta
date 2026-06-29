import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"

export default async function AsistenciaPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const ctData = await query<any[]>(
    "SELECT ct.*, c.id as c_id, c.name as c_name, g.id as g_id, g.name as g_name, sec.id as sec_id, sec.name as sec_name FROM CourseTeacher ct LEFT JOIN Course c ON c.id = ct.courseId LEFT JOIN Grade g ON g.id = ct.gradeId LEFT JOIN Section sec ON sec.id = ct.sectionId WHERE ct.teacherId = ?",
    [teacherId]
  )

  const courseTeachers = ctData.map((ct) => ({
    id: ct.id,
    courseId: ct.courseId,
    gradeId: ct.gradeId,
    sectionId: ct.sectionId,
    course: { id: ct.c_id, name: ct.c_name },
    grade: ct.g_id ? { id: ct.g_id, name: ct.g_name } : null,
    section: ct.sec_id ? { id: ct.sec_id, name: ct.sec_name } : null,
  }))

  const attendanceData = await query<any[]>(
    "SELECT a.*, s.firstName as s_firstName, s.lastName as s_lastName FROM Attendance a LEFT JOIN Student s ON s.id = a.studentId WHERE a.teacherId = ? ORDER BY a.date DESC LIMIT 20",
    [teacherId]
  )

  const recentAttendance = attendanceData.map((a) => ({
    id: a.id,
    date: a.date,
    isPresent: !!a.isPresent,
    note: a.note,
    student: { firstName: a.s_firstName, lastName: a.s_lastName },
  }))

  return (
    <div className="space-y-8" data-tour="attendance">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Asistencia</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{courseTeachers.length} cursos disponibles</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-icons text-base text-gray-400 dark:text-zinc-500">fact_check</span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Tomar Asistencia</h2>
        </div>
        {courseTeachers.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-12 text-center text-gray-400 dark:text-zinc-500 text-sm">
            No tienes cursos asignados para tomar asistencia.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {courseTeachers.map((ct: { id: number; courseId: number; gradeId: number | null; sectionId: number | null; course: { name: string }; grade: { name: string } | null; section: { name: string } | null }) => (
              <Link
                key={ct.id}
                href={`/dashboard/teacher/asistencia/tomar?courseId=${ct.courseId}&gradeId=${ct.gradeId ?? ""}&sectionId=${ct.sectionId ?? ""}`}
                className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-black/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="material-icons text-base text-gray-300 dark:text-zinc-600 group-hover:text-gray-500 dark:group-hover:text-zinc-400 transition-colors">arrow_forward</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white/90">{ct.course.name}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                  {ct.grade?.name ?? "—"} / {ct.section?.name ?? "—"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-icons text-base text-gray-400 dark:text-zinc-500">history</span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Registros Recientes</h2>
        </div>
        {recentAttendance.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-8 text-center text-gray-400 dark:text-zinc-500 text-sm">
            Sin registros.
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="hidden md:table-header-group border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60">
                <tr className="text-left">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 px-4 py-3.5">Estudiante</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 px-4 py-3.5">Fecha</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 px-4 py-3.5">Presente</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 px-4 py-3.5">Nota</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((a: { id: number; date: string | Date; isPresent: boolean; note: string | null; student: { firstName: string; lastName: string } }) => {
                  const dateStr = typeof a.date === "string" ? a.date : a.date.toISOString().substring(0, 10)
                  const dateObj = new Date(dateStr)
                  return (
                  <tr key={a.id} className="flex flex-col md:table-row border border-gray-100 dark:border-zinc-800/50 md:border-0 rounded-2xl p-4 md:p-0 mb-3 md:mb-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-900 dark:text-white/90 font-medium">
                      <span className="md:hidden text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">Estudiante</span>
                      <span>{a.student.firstName} {a.student.lastName}</span>
                    </td>
                    <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-600 dark:text-zinc-400">
                      <span className="md:hidden text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">Fecha</span>
                      <span>{dateObj.toLocaleDateString("es-ES")}</span>
                    </td>
                    <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                      <span className="md:hidden text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">Presente</span>
                      <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        a.isPresent
                          ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                          : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}>
                        {a.isPresent ? "Presente" : "Ausente"}
                      </span>
                    </td>
                    <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-500 dark:text-zinc-400">
                      <span className="md:hidden text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">Nota</span>
                      <span>{a.note ?? "—"}</span>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}