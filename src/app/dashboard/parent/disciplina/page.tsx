import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getParentChildren, getChildrenDiscipline } from "@/lib/parent-data"
import DisciplineTable from "./DisciplineTable"

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
                <DisciplineTable records={records} />
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
