import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { query, findOne } from "@/lib/prisma"

export default async function TeacherPerfilPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const user = await query<any[]>(
    "SELECT id, email, name, role, createdAt FROM User WHERE id = ?",
    [Number(session.user.id)]
  )

  const teacher = await query<any[]>(
    `SELECT t.*, i.name AS institutionName
     FROM Teacher t
     LEFT JOIN Institution i ON t.institutionId = i.id
     WHERE t.id = ?`,
    [teacherId]
  )

  const courses = await query<any[]>(
    `SELECT ct.id, c.name AS courseName, g.name AS gradeName, g.level, sec.name AS sectionName
     FROM CourseTeacher ct
     LEFT JOIN Course c ON ct.courseId = c.id
     LEFT JOIN Grade g ON ct.gradeId = g.id
     LEFT JOIN Section sec ON ct.sectionId = sec.id
     WHERE ct.teacherId = ?
     ORDER BY c.name`,
    [teacherId]
  )

  const t = teacher[0]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">Información personal y cursos asignados</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-3">Datos del Docente</h2>
        <div className="bg-emerald-50 border border-emerald-200 rounded-[25px] p-6">
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
              <p className="text-xs text-gray-400">Institución</p>
              <p className="font-medium">{t?.institutionName ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Especialidad</p>
              <p className="font-medium">{t?.speciality ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Documento</p>
              <p className="font-medium">{t?.documentId ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Título Profesional</p>
              <p className="font-medium">{t?.professionalTitle ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Nivel de Educación</p>
              <p className="font-medium">{t?.educationLevel ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tipo de Contrato</p>
              <p className="font-medium">{t?.contractType ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha de Contratación</p>
              <p className="font-medium">{t?.hireDate ? new Date(t.hireDate).toLocaleDateString("es-PE") : "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400">Dirección</p>
              <p className="font-medium">{t?.address ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Contacto Emergencia</p>
              <p className="font-medium">{t?.emergencyContactName ? `${t.emergencyContactName} (${t.emergencyContactPhone ?? "—"})` : "—"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Cursos Asignados</h2>
        {courses.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-[25px] p-8 text-center text-gray-400 text-sm">
            No tienes cursos asignados.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c: any) => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-[20px] p-5">
                <p className="font-semibold text-sm">{c.courseName}</p>
                <p className="text-xs text-gray-400 mt-1">{c.gradeName ?? "—"} · {c.sectionName ?? "—"}</p>
                {c.level && <p className="text-xs text-gray-400">{c.level}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
