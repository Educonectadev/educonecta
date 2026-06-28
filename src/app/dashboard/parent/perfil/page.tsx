import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getParentChildren, getChildrenGrades } from "@/lib/parent-data"
import BrandColorPicker from "@/components/BrandColorPicker"
import ParentDownloads from "@/components/ParentDownloads"

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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">Información personal y rendimiento académico de tus hijos</p>
        </div>
        {children.length > 0 && <ParentDownloads />}
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">Datos del Padre</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-[25px] p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">Nombre</p>
            <p className="font-medium text-[#1a1a1a]">{session.user.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="font-medium text-[#1a1a1a]">{session.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Rol</p>
            <p className="font-medium text-[#1a1a1a]">Padre de Familia</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Institución</p>
            <p className="font-medium text-[#1a1a1a]">{session.user.institutionName ?? "—"}</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <BrandColorPicker />
      </section>

      {children.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-[25px] p-12 text-center text-gray-400">
          No hay estudiantes vinculados a su cuenta.
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
            <section key={child.id} className="bg-white border border-gray-100 rounded-[25px] p-6">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{child.firstName} {child.lastName}</h2>
                  <p className="text-sm text-gray-400">
                    {child.grade?.name ?? "—"} · {child.section?.name ?? "—"}
                    {child.grade?.level ? ` · ${child.grade.level}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {passes !== null && (
                    <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                      passes ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-500 border border-red-200"
                    }`}>
                      {passes ? "Sí pasa" : "No pasa"}
                    </span>
                  )}
                  <ParentDownloads studentId={child.id} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-5">
                <div>
                  <p className="text-xs text-gray-400">Documento</p>
                  <p className="font-medium">{child.documentId ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium">{child.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Teléfono</p>
                  <p className="font-medium">{child.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Estado</p>
                  <p className={`font-medium ${child.isActive ? "text-green-600" : "text-red-500"}`}>
                    {child.isActive ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Rendimiento Académico {grades.length > 0 ? `(${grades.length} notas)` : ""}
                </h3>

                {courseAverages.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin notas registradas</p>
                ) : (
                  <div className="space-y-2">
                    {courseAverages.map((ca) => (
                      <div key={ca.courseName} className="flex items-center justify-between bg-gray-50 rounded-[15px] px-4 py-3 border border-gray-100">
                        <div>
                          <p className="font-medium text-sm">{ca.courseName}</p>
                          <p className="text-xs text-gray-400">{ca.evaluations} evaluación(es)</p>
                        </div>
                        <span className={`font-bold text-sm ${ca.average >= passingGrade ? "text-green-600" : "text-red-500"}`}>
                          {ca.average.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {overallAverage !== null && (
                  <div className={`mt-3 flex items-center justify-between rounded-[15px] px-4 py-3 ${
                    passes ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}>
                    <div>
                      <p className="font-semibold text-sm">Promedio General</p>
                      <p className="text-xs text-gray-400">Nota mínima: {passingGrade}</p>
                    </div>
                    <span className={`font-bold text-base ${passes ? "text-green-600" : "text-red-500"}`}>
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
