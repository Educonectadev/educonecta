import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getParentChildren, getChildrenGrades } from "@/lib/parent-data"

export default async function CalificacionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

  const parentId = session.user.parentId!
  const parent = await getParentChildren(parentId)
  if (!parent) redirect("/login")

  const children = parent.children.map((ps) => ps.student)
  const studentIds = children.map((s) => s.id)

  const gradesByStudent = await getChildrenGrades(studentIds)

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Calificaciones</h1>
      <p className="mt-1 text-sm text-gray-500">
        Notas y evaluaciones de sus hijos
      </p>

      {children.length === 0 && (
        <div className="mt-12 text-center text-gray-500">
          No hay estudiantes vinculados.
        </div>
      )}

      <div className="mt-6 space-y-8">
        {children.map((child) => {
          const grades = gradesByStudent[child.id] ?? []

          const byCourse: Record<string, typeof grades> = {}
          for (const g of grades) {
            const key = g.course.name
            if (!byCourse[key]) byCourse[key] = []
            byCourse[key].push(g)
          }

          const courseAverages: Record<string, string> = {}
          for (const [course, gs] of Object.entries(byCourse)) {
            const avg =
              gs.reduce((sum, g) => sum + g.grade, 0) / gs.length
            courseAverages[course] = avg.toFixed(1)
          }

          return (
            <section key={child.id}>
              <h2 className="mb-3 text-lg font-semibold">
                {child.firstName} {child.lastName}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {child.grade?.name ?? "—"}
                </span>
              </h2>

               {grades.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay calificaciones registradas.
                </p>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="hidden md:table-header-group border-b border-gray-100">
                      <tr>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Curso
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Evaluación
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Nota
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Fecha
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Promedio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 md:divide-y-0">
                      {Object.entries(byCourse).map(([courseName, gs]) =>
                        gs.map((g, idx) => (
                          <tr key={g.id} className="flex flex-col md:table-row border border-gray-100 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0 hover:bg-gray-50/50 transition-colors">
                            {idx === 0 && (
                              <td
                                rowSpan={gs.length}
                                className="hidden md:table-cell px-4 py-3 font-medium"
                              >
                                {courseName}
                              </td>
                            )}
                            <td className="md:hidden flex justify-between px-0 py-1">
                              <span className="text-xs uppercase tracking-widest text-gray-500">Curso</span>
                              <span className="font-medium">{courseName}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-500">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Evaluación</span>
                              <span>{g.evaluationName}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Nota</span>
                              <span>{g.grade}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-500">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Fecha</span>
                              <span>
                                {g.evaluationDate
                                  ? new Date(
                                      g.evaluationDate
                                    ).toLocaleDateString("es-ES")
                                  : "—"}
                              </span>
                            </td>
                            {idx === 0 && (
                              <td
                                rowSpan={gs.length}
                                className="hidden md:table-cell px-4 py-3 font-medium"
                              >
                                {courseAverages[courseName]}
                              </td>
                            )}
                            <td className="md:hidden flex justify-between px-0 py-1 border-t border-gray-50 pt-2 mt-2">
                              <span className="text-xs uppercase tracking-widest text-gray-500">Promedio</span>
                              <span className="font-medium">{courseAverages[courseName]}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
