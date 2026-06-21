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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Calificaciones</h1>
        <Link
          href="/dashboard/teacher/calificaciones/registrar"
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-[30px] text-sm font-medium hover:bg-emerald-700 transition-all text-center"
        >
          + Registrar Notas
        </Link>
      </div>

      {grades.length === 0 ? (
        <p className="text-sm text-gray-500">No hay calificaciones registradas.</p>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-[30px]">
          <table className="w-full text-sm border-collapse">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-gray-200 text-left">
                <th className="py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-widest">Estudiante</th>
                <th className="py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-widest">Curso</th>
                <th className="py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-widest">Evaluación</th>
                <th className="py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-widest">Nota</th>
                <th className="py-3 px-5 font-medium text-gray-500 text-xs uppercase tracking-widest">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g: { id: number; student: { firstName: string; lastName: string }; course: { name: string }; evaluationName: string; grade: number; evaluationDate: Date | null }) => (
                <tr key={g.id} className="flex flex-col md:table-row border border-gray-200 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0">
                  <td className="flex justify-between md:table-cell px-0 md:px-5 py-1 md:py-3">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Estudiante</span>
                    <span>{g.student.firstName} {g.student.lastName}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-5 py-1 md:py-3 text-gray-600">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Curso</span>
                    <span>{g.course.name}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-5 py-1 md:py-3 text-gray-600">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Evaluación</span>
                    <span>{g.evaluationName}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-5 py-1 md:py-3 font-medium">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Nota</span>
                    <span>{g.grade}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-5 py-1 md:py-3 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Fecha</span>
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
