import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getParentChildren, getChildrenGrades } from "@/lib/parent-data"
import BrandColorPicker from "@/components/BrandColorPicker"
import ParentDownloads from "@/components/ParentDownloads"
import ChangePasswordForm from "@/components/ChangePasswordForm"

export default async function PerfilPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

  const parentId = session.user.parentId!
  const parent = await getParentChildren(parentId)
  if (!parent) redirect("/login")

  const children = parent.children.map((ps: any) => ps.student)
  const studentIds = children.map((s: any) => s.id)
  const gradesByStudent = await getChildrenGrades(studentIds)

  const passingGrade = 11

  function getCourseAverages(grades: any[]) {
    const byCourse: Record<string, { grades: number[]; evaluations: any[] }> = {}
    for (const g of grades) {
      const name = g.course.name
      if (!byCourse[name]) byCourse[name] = { grades: [], evaluations: [] }
      byCourse[name].grades.push(g.grade)
      byCourse[name].evaluations.push(g)
    }
    return Object.entries(byCourse).map(([courseName, data]) => ({
      courseName,
      average: data.grades.reduce((a, b) => a + b, 0) / data.grades.length,
      evaluations: data.evaluations.length,
    }))
  }

  return (
    <div data-tour="profile" className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <header>
          <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Perfil</p>
          <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mi Perfil</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Informaci&oacute;n personal y rendimiento acad&eacute;mico de tus hijos</p>
        </header>
        {children.length > 0 && <ParentDownloads />}
      </div>

      <section>
        <p className="sa-eyebrow mb-3" style={{ color: "#d97706" }}>Datos del Padre</p>
        <div className="sa-surface p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm"
          style={{ background: "rgba(217, 119, 6, 0.06)", borderColor: "rgba(217, 119, 6, 0.2)" }}>
          <div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Nombre</p>
            <p className="font-medium" style={{ color: "var(--foreground)" }}>{session.user.name}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Email</p>
            <p className="font-medium" style={{ color: "var(--foreground)" }}>{session.user.email}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Rol</p>
            <p className="font-medium" style={{ color: "var(--foreground)" }}>Padre de Familia</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Instituci&oacute;n</p>
            <p className="font-medium" style={{ color: "var(--foreground)" }}>{session.user.institutionName ?? "—"}</p>
          </div>
        </div>
      </section>

      <section>
        <BrandColorPicker />
      </section>

      <section className="max-w-md">
        <ChangePasswordForm apiEndpoint="/api/parent/password" />
      </section>

      {children.length === 0 && (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin estudiantes vinculados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay estudiantes vinculados a su cuenta.</p>
        </div>
      )}

      <div className="space-y-6">
        {children.map((child: any) => {
          const grades = gradesByStudent[child.id] ?? []
          const courseAverages = getCourseAverages(grades)
          const overallAverage = grades.length > 0
            ? grades.reduce((s: number, g: any) => s + g.grade, 0) / grades.length
            : null
          const passes = overallAverage !== null ? overallAverage >= passingGrade : null

          return (
            <section key={child.id} className="sa-surface p-6">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>{child.firstName} {child.lastName}</h2>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {child.grade?.name ?? "—"} &middot; {child.section?.name ?? "—"}
                    {child.grade?.level ? ` &middot; ${child.grade.level}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {passes !== null && (
                    <span className="sa-chip text-sm font-bold px-4 py-1.5"
                      style={passes ? { color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)" } : { color: "#ef4444", background: "rgba(239, 68, 68, 0.12)" }}>
                      {passes ? "S&iacute; pasa" : "No pasa"}
                    </span>
                  )}
                  <ParentDownloads studentId={child.id} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-5">
                <div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Documento</p>
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>{child.documentId ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Email</p>
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>{child.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Tel&eacute;fono</p>
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>{child.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Estado</p>
                  <p className="font-medium" style={{ color: child.isActive ? "var(--accent)" : "#ef4444" }}>
                    {child.isActive ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>

              <div className="pt-4" style={{ borderTop: "1px solid var(--surface-border)" }}>
                <h3 className="sa-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
                  Rendimiento Acad&eacute;mico {grades.length > 0 ? `(${grades.length} notas)` : ""}
                </h3>

                {courseAverages.length === 0 ? (
                  <div className="sa-surface-flat py-6 text-center">
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin notas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {courseAverages.map((ca) => (
                      <div key={ca.courseName} className="flex items-center justify-between sa-surface-flat px-4 py-3" style={{ borderRadius: "var(--radius-tile)" }}>
                        <div>
                          <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{ca.courseName}</p>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{ca.evaluations} evaluaci&oacute;n(es)</p>
                        </div>
                        <span className="font-bold text-sm" style={{ color: ca.average >= passingGrade ? "var(--accent)" : "#ef4444" }}>
                          {ca.average.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {overallAverage !== null && (
                  <div className="mt-3 flex items-center justify-between px-4 py-3"
                    style={{ borderRadius: "var(--radius-tile)", background: passes ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "rgba(239, 68, 68, 0.12)" }}>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Promedio General</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Nota m&iacute;nima: {passingGrade}</p>
                    </div>
                    <span className="font-bold text-base" style={{ color: passes ? "var(--accent)" : "#ef4444" }}>
                      {overallAverage.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
