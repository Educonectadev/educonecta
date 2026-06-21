import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query, findOne } from "@/lib/prisma"

export default async function AdminPerfilPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!

  const user = await query<any[]>(
    "SELECT id, email, name, role, createdAt FROM User WHERE id = ?",
    [Number(session.user.id)]
  )

  const institution = await findOne("Institution", { id: institutionId })

  const stats = await query<any[]>(
    `SELECT
       (SELECT COUNT(*) FROM Student WHERE institutionId = ? AND isActive = 1) AS totalStudents,
       (SELECT COUNT(*) FROM Teacher WHERE institutionId = ?) AS totalTeachers,
       (SELECT COUNT(*) FROM Course WHERE institutionId = ?) AS totalCourses,
       (SELECT COUNT(*) FROM Schedule WHERE institutionId = ?) AS totalSchedules,
       (SELECT COUNT(*) FROM Grade WHERE institutionId = ?) AS totalGrades,
       (SELECT COUNT(*) FROM Section WHERE gradeId IN (SELECT id FROM Grade WHERE institutionId = ?)) AS totalSections`,
    [institutionId, institutionId, institutionId, institutionId, institutionId, institutionId]
  )

  const s = stats[0]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">Información personal y datos de la institución</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">Datos del Administrador</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-[25px] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Nombre</p>
              <p className="font-medium">{user[0]?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-medium">{user[0]?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Rol</p>
              <p className="font-medium">Administrador Institucional</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">Datos de la Institución</h2>
        <div className="bg-white border border-gray-100 rounded-[25px] p-6">
          {institution ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Nombre</p>
                <p className="font-medium">{(institution as any).name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Código</p>
                <p className="font-medium">{(institution as any).code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Tipo</p>
                <p className="font-medium">{(institution as any).type ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">RUC</p>
                <p className="font-medium">{(institution as any).ruc ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Director</p>
                <p className="font-medium">{(institution as any).directorName ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Teléfono</p>
                <p className="font-medium">{(institution as any).phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium">{(institution as any).email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Website</p>
                <p className="font-medium">{(institution as any).website ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Dirección</p>
                <p className="font-medium">{(institution as any).address ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Distrito</p>
                <p className="font-medium">{(institution as any).district ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Provincia</p>
                <p className="font-medium">{(institution as any).province ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Departamento</p>
                <p className="font-medium">{(institution as any).department ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Nivel Educativo</p>
                <p className="font-medium">{(institution as any).educationalLevel ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Turnos</p>
                <p className="font-medium">{(institution as any).shifts ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Año de Fundación</p>
                <p className="font-medium">{(institution as any).foundedYear ?? "—"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No se encontraron datos de la institución.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Estadísticas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{s?.totalStudents ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Estudiantes</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{s?.totalTeachers ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Docentes</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{s?.totalCourses ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Cursos</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{s?.totalGrades ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Grados</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{s?.totalSections ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Secciones</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{s?.totalSchedules ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Horarios</p>
          </div>
        </div>
      </section>
    </div>
  )
}
