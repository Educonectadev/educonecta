import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import BrandColorPicker from "@/components/BrandColorPicker"

export default async function TeacherPerfilPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const user = await query<any[]>(
    "SELECT id, email, name, role, createdAt FROM User WHERE id = ?",
    [Number(session.user.id)]
  )

  const teacher = await query<any[]>(
    `SELECT t.*, i.name AS "institutionName"
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Información personal y cursos asignados</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-3">Datos del Docente</h2>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-[25px] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Nombre</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{user[0]?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Email</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{user[0]?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Institución</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{t?.institutionName ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Especialidad</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{t?.speciality ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Documento</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{t?.documentId ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Título Profesional</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{t?.title ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Nivel de Educación</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{t?.educationLevel ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Tipo de Contrato</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{t?.contractType ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Fecha de Contratación</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{t?.hireDate ? new Date(t.hireDate).toLocaleDateString("es-PE") : "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Dirección</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{t?.address ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Contacto Emergencia</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{t?.emergencyContact ? `${t.emergencyContact} (${t.emergencyPhone ?? "—"})` : "—"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <BrandColorPicker />
      </section>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Cursos Asignados</h2>
        {courses.length === 0 ? (
          <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-[25px] p-8 text-center text-gray-400 dark:text-zinc-500 text-sm">
            No tienes cursos asignados.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c: any) => (
              <div key={c.id} className="bg-white dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-[20px] p-5">
                <p className="font-semibold text-sm text-gray-900 dark:text-white/90">{c.courseName}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{c.gradeName ?? "—"} · {c.sectionName ?? "—"}</p>
                {c.level && <p className="text-xs text-gray-400 dark:text-zinc-500">{c.level}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
