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
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Tareas</p>
        <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Tareas</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Tareas y trabajos asignados a sus hijos
        </p>
      </header>

      {children.length === 0 && (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin estudiantes vinculados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay estudiantes vinculados.</p>
        </div>
      )}

      <div className="space-y-8">
        {children.map((child) => {
          const hws = homeworksByStudent[child.id] ?? []
          return (
            <section key={child.id}>
              <h2 className="mb-3 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                {child.firstName} {child.lastName}
                <span className="ml-2 text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>
                  {child.grade?.name ?? "—"} &middot; {child.section?.name ?? "—"}
                </span>
              </h2>

               {hws.length === 0 ? (
                <div className="sa-surface py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin tareas</p>
                  <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay tareas registradas.</p>
                </div>
              ) : (
                <div className="sa-surface overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="hidden md:table-header-group" style={{ borderBottom: "1px solid var(--surface-border)", background: "var(--surface-2)" }}>
                      <tr>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                          T&iacute;tulo
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                          Curso
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                          Fecha l&iacute;mite
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      {hws.map((hw) => {
                        const sub = hw.submissions.find(
                          (s: any) => s.studentId === child.id
                        )
                        const submitted = sub?.submitted ?? false
                        const overdue = new Date(hw.dueDate) < new Date()
                        return (
                          <tr key={hw.id} className="flex flex-col md:table-row rounded-[var(--radius-card)] p-4 md:p-0 mb-3 md:mb-0 border border-[var(--surface-border)] md:border-0"
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)" }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "" }}>
                            <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                              <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>T&iacute;tulo</span>
                              <span style={{ color: "var(--foreground)" }}>{hw.title}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3" style={{ color: "var(--muted-foreground)" }}>
                              <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Curso</span>
                              <span>{hw.course.name}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3" style={{ color: "var(--muted-foreground)" }}>
                              <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Fecha l&iacute;mite</span>
                              <span>{new Date(hw.dueDate).toLocaleDateString("es-ES")}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                              <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Estado</span>
                              <span>
                                {submitted ? (
                                  <span className="sa-chip" style={{ color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}>Entregado</span>
                                ) : overdue ? (
                                  <span className="sa-chip" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.12)" }}>Vencido</span>
                                ) : (
                                  <span className="sa-chip" style={{ color: "#d97706", background: "rgba(217, 119, 6, 0.14)" }}>Pendiente</span>
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
