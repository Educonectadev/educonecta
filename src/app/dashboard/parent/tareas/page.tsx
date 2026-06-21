import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getParentChildren, getChildrenHomeworks } from "@/lib/parent-data"

export default async function TareasPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

  const parentId = session.user.parentId!
  const parent = await getParentChildren(parentId)
  if (!parent) redirect("/login")

  const children = parent.children.map((ps) => ps.student)
  const studentIds = children.map((s) => s.id)
  const gradeIds = children.map((s) => s.gradeId).filter(Boolean) as number[]
  const sectionIds = children.map((s) => s.sectionId).filter(Boolean) as number[]

  const homeworksByStudent =
    gradeIds.length && sectionIds.length
      ? await getChildrenHomeworks(studentIds, gradeIds, sectionIds)
      : {}

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
      <p className="mt-1 text-sm text-gray-500">
        Tareas y trabajos asignados a sus hijos
      </p>

      {children.length === 0 && (
        <div className="mt-12 text-center text-gray-500">
          No hay estudiantes vinculados.
        </div>
      )}

      <div className="mt-6 space-y-8">
        {children.map((child) => {
          const hws = homeworksByStudent[child.id] ?? []
          return (
            <section key={child.id}>
              <h2 className="mb-3 text-lg font-semibold">
                {child.firstName} {child.lastName}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {child.grade?.name ?? "—"} · {child.section?.name ?? "—"}
                </span>
              </h2>

               {hws.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay tareas registradas.
                </p>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-[30px]">
                  <table className="w-full text-left text-sm">
                    <thead className="hidden md:table-header-group border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">
                          Título
                        </th>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">
                          Curso
                        </th>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">
                          Fecha límite
                        </th>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 md:divide-y-0">
                      {hws.map((hw) => {
                        const sub = hw.submissions.find(
                          (s: any) => s.studentId === child.id
                        )
                        const submitted = sub?.submitted ?? false
                        const overdue = new Date(hw.dueDate) < new Date()
                        return (
                          <tr key={hw.id} className="flex flex-col md:table-row border border-gray-100 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0">
                            <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Título</span>
                              <span>{hw.title}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Curso</span>
                              <span>{hw.course.name}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Fecha límite</span>
                              <span>{new Date(hw.dueDate).toLocaleDateString("es-ES")}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Estado</span>
                              <span>
                                {submitted ? (
                                  <span className="text-green-700">Entregado</span>
                                ) : overdue ? (
                                  <span className="text-red-700">Vencido</span>
                                ) : (
                                  <span className="text-gray-600">Pendiente</span>
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
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
