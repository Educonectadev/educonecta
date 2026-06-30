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
    <div data-tour="discipline" className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Disciplina</p>
        <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Disciplina</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Registro disciplinario de sus hijos
        </p>
      </header>

      {children.length === 0 && (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin estudiantes vinculados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay estudiantes vinculados.</p>
        </div>
      )}

      <div className="space-y-8">
        {children.map((child) => {
          const records = disciplineByStudent[child.id] ?? []
          const resolvedCount = records.filter((r) => r.isResolved).length
          const openCount = records.length - resolvedCount

          return (
            <section key={child.id}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                  {child.firstName} {child.lastName}
                  <span className="ml-2 text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>
                    {child.grade?.name ?? "—"} &middot; {child.section?.name ?? "—"}
                  </span>
                </h2>
                {records.length > 0 && (
                  <div className="flex gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <span style={{ color: "var(--accent)" }}>
                      Resueltos: {resolvedCount}
                    </span>
                    <span style={{ color: "#ef4444" }}>
                      Abiertos: {openCount}
                    </span>
                  </div>
                )}
              </div>

              {records.length === 0 ? (
                <div className="sa-surface py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin registros</p>
                  <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Sin registros disciplinarios.</p>
                </div>
              ) : (
                <div className="sa-surface overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="hidden md:table-header-group" style={{ borderBottom: "1px solid var(--surface-border)", background: "var(--surface-2)" }}>
                      <tr>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                          Fecha
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                          Tipo
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                          Descripci&oacute;n
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                          Estado
                        </th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                          Registrado por
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      {records.map((r) => (
                        <tr key={r.id} className="flex flex-col md:table-row rounded-[var(--radius-card)] p-4 md:p-0 mb-3 md:mb-0 border border-[var(--surface-border)] md:border-0"
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)" }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "" }}>
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                            <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Fecha</span>
                            <span style={{ color: "var(--foreground)" }}>
                              {new Date(r.date).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                            <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Tipo</span>
                            <span>
                              <span className="sa-chip text-xs font-medium" style={{ color: "var(--muted-foreground)", background: "var(--surface-3)" }}>
                                {r.type}
                              </span>
                            </span>
                          </td>
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3" style={{ color: "var(--foreground)" }}>
                            <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Descripci&oacute;n</span>
                            <span>{r.description}</span>
                          </td>
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                            <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Estado</span>
                            <span>
                              {r.isResolved ? (
                                <span className="sa-chip" style={{ color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}>Resuelto</span>
                              ) : (
                                <span className="sa-chip" style={{ color: "#d97706", background: "rgba(217, 119, 6, 0.14)" }}>Pendiente</span>
                              )}
                            </span>
                          </td>
                          <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3" style={{ color: "var(--muted-foreground)" }}>
                            <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Registrado por</span>
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
