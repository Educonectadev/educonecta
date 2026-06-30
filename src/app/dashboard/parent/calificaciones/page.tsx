import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getParentChildren, getChildrenGrades } from "@/lib/parent-data"
import GradesTable from "./GradesTable"

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
    <div data-tour="grades" className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Calificaciones</p>
        <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Calificaciones</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Notas y evaluaciones de sus hijos
        </p>
      </header>

      {children.length === 0 && (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin estudiantes vinculados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay estudiantes vinculados.</p>
        </div>
      )}

      <div className="space-y-8">
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
              <h2 className="mb-3 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                {child.firstName} {child.lastName}
                <span className="ml-2 text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>
                  {child.grade?.name ?? "—"}
                </span>
              </h2>

               {grades.length === 0 ? (
                <div className="sa-surface py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin calificaciones</p>
                  <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay calificaciones registradas.</p>
                </div>
              ) : (
                <GradesTable grades={grades} child={child} byCourse={byCourse} />
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
