import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getParentChildren, getChildrenDiscipline } from "@/lib/parent-data"

export default async function DisciplinaPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

  const parentId = session.user.parentId!
  const parent = await getParentChildren(parentId)
  if (!parent) redirect("/login")

  const children = parent.children.map((ps) => ps.student)
  const studentIds = children.map((s) => s.id)

  const disciplineByStudent = await getChildrenDiscipline(studentIds)

  return (
    <div data-tour="discipline">
      <h1 className="text-2xl font-bold tracking-tight">Disciplina</h1>
      <p className="mt-1 text-sm text-gray-500">
        Registro disciplinario de sus hijos
      </p>

      {children.length === 0 && (
        <div className="mt-12 text-center text-gray-500">
          No hay estudiantes vinculados.
        </div>
      )}

      <div className="mt-6 space-y-8">
        {children.map((child) => {
          const records = disciplineByStudent[child.id] ?? []
          const resolvedCount = records.filter((r) => r.isResolved).length
          const openCount = records.length - resolvedCount

          return (
            <section key={child.id}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">
                  {child.firstName} {child.lastName}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {child.grade?.name ?? "—"} · {child.section?.name ?? "—"}
                  </span>
                </h2>
                {records.length > 0 && (
                  <div className="flex gap-4 text-xs">
                    <span className="text-green-700">
                      Resueltos: {resolvedCount}
                    </span>
                    <span className="text-red-700">
                      Abiertos: {openCount}
                    </span>
                  </div>
                )}
              </div>

              {records.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Sin registros disciplinarios.
                </p>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="hidden md:table-header-group border-b border-gray-100">
                      <tr>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Fecha
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Tipo
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Descripción
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Estado
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3.5">
                          Registrado por
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 md:divide-y-0">
                      {records.map((r) => (
                        <tr key={r.id} className="flex flex-col md:table-row border border-gray-100 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0 hover:bg-gray-50/50 transition-colors">
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                            <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Fecha</span>
                            <span>
                              {new Date(r.date).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                            <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Tipo</span>
                            <span>
                              <span className="rounded-[30px] bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                {r.type}
                              </span>
                            </span>
                          </td>
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-600">
                            <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Descripción</span>
                            <span>{r.description}</span>
                          </td>
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                            <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Estado</span>
                            <span>
                              {r.isResolved ? (
                                <span className="text-green-700">Resuelto</span>
                              ) : (
                                <span className="text-red-700">Pendiente</span>
                              )}
                            </span>
                          </td>
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 text-gray-500">
                            <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Registrado por</span>
                            <span>{r.teacher?.user?.name ?? "—"}</span>
                          </td>
                        </tr>
                      ))}
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
