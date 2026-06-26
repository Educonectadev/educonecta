import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"

export default async function CalificacionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const data = await query<any[]>(
    "SELECT gr.*, s.firstName as s_firstName, s.lastName as s_lastName, c.id as c_id, c.name as c_name FROM GradeRecord gr LEFT JOIN Student s ON s.id = gr.studentId LEFT JOIN Course c ON c.id = gr.courseId WHERE gr.teacherId = ? ORDER BY gr.createdAt DESC LIMIT 50",
    [teacherId]
  )

  const grades = data.map((g) => ({
    id: g.id,
    evaluationName: g.evaluationName,
    grade: g.grade,
    evaluationDate: g.evaluationDate,
    createdAt: g.createdAt,
    student: { firstName: g.s_firstName, lastName: g.s_lastName },
    course: { id: g.c_id, name: g.c_name },
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Calificaciones</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{grades.length} registradas</p>
        </div>
        <Link
          href="/dashboard/teacher/calificaciones/registrar"
          className="btn-primary rounded-[30px] px-6 py-2.5 text-sm font-medium text-center"
        >
          + Registrar Notas
        </Link>
      </div>

      {grades.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-12 text-center text-gray-400 dark:text-zinc-500 text-sm">
          No hay calificaciones registradas.
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group border-b border-gray-100 dark:border-zinc-800">
              <tr className="text-left">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-4 py-3.5">Estudiante</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-4 py-3.5">Curso</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-4 py-3.5">Evaluación</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-4 py-3.5">Nota</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-4 py-3.5">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g: { id: number; student: { firstName: string; lastName: string }; course: { name: string }; evaluationName: string; grade: number; evaluationDate: Date | null }) => (
                <tr key={g.id} className="flex flex-col md:table-row border border-gray-100 dark:border-zinc-800/50 md:border-0 rounded-2xl p-4 md:p-0 mb-3 md:mb-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-900 dark:text-white/90 font-medium">
                    <span className="md:hidden text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">Estudiante</span>
                    <span>{g.student.firstName} {g.student.lastName}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-600 dark:text-zinc-400">
                    <span className="md:hidden text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">Curso</span>
                    <span>{g.course.name}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-600 dark:text-zinc-400">
                    <span className="md:hidden text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">Evaluación</span>
                    <span>{g.evaluationName}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 font-semibold text-gray-900 dark:text-white/90">
                    <span className="md:hidden text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">Nota</span>
                    <span>{g.grade}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-500 dark:text-zinc-400">
                    <span className="md:hidden text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">Fecha</span>
                    <span>{g.evaluationDate?.toLocaleDateString("es-ES") ?? "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}