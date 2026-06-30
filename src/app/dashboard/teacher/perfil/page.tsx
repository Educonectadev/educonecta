import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import BrandColorPicker from "@/components/BrandColorPicker"
import ChangePasswordForm from "@/components/ChangePasswordForm"

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

  const explicitLevels: string[] = Array.isArray(t?.assignedLevels) ? t.assignedLevels : []
  const levelsToShow = explicitLevels
    .map((lvl) => lvl.toUpperCase())
    .filter((lvl) => ["INICIAL", "PRIMARIA", "SECUNDARIA"].includes(lvl))

  const levelStyles: Record<string, { bg: string; text: string }> = {
    INICIAL: { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-300" },
    PRIMARIA: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300" },
    SECUNDARIA: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-300" },
  }

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Docente / Perfil</p>
          <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mi Perfil</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Información personal y cursos asignados</p>
        </div>
        {levelsToShow.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Niveles:</span>
            {levelsToShow.map((lvl) => {
              const style = levelStyles[lvl] ?? { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" }
              const label = lvl.charAt(0) + lvl.slice(1).toLowerCase()
              return (
                <span key={lvl} className={`sa-chip text-xs font-medium ${style.bg} ${style.text}`}>
                  {label}
                </span>
              )
            })}
          </div>
        )}
      </header>

      <section>
        <h2 className="sa-eyebrow mb-3" style={{ color: "var(--accent)" }}>Datos del Docente</h2>
        <div className="sa-surface p-6" style={{ borderColor: "var(--accent-soft)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Nombre</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{user[0]?.name}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Email</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{user[0]?.email}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Institución</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{t?.institutionName ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Especialidad</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{t?.speciality ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Documento</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{t?.documentId ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Título Profesional</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{t?.title ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Nivel de Educación</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{t?.educationLevel ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Tipo de Contrato</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{t?.contractType ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Fecha de Contratación</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{t?.hireDate ? new Date(t.hireDate).toLocaleDateString("es-PE") : "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Dirección</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{t?.address ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Contacto Emergencia</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{t?.emergencyContact ? `${t.emergencyContact} (${t.emergencyPhone ?? "—"})` : "—"}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <BrandColorPicker />
      </section>

      <section className="max-w-md">
        <ChangePasswordForm apiEndpoint="/api/teacher/password" />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Cursos Asignados</h2>
          {courses.length > 0 && (
            <a
              href="/dashboard/teacher/courses"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Ver tabla completa →
            </a>
          )}
        </div>
        {courses.length === 0 ? (
          <div className="sa-surface py-14 md:py-16 text-center">
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No tienes cursos asignados.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c: any) => {
              const courseName: string | null = c.courseName ?? c.coursename ?? c["courseName"] ?? null
              const gradeName: string | null = c.gradeName ?? c.gradename ?? null
              const sectionName: string | null = c.sectionName ?? c.sectionname ?? null
              const levelRaw: string = (c.level ?? "").toString().trim()
              const lvl = levelRaw.toUpperCase()
              const levelStyle = lvl === "INICIAL"
                ? "bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
                : lvl === "PRIMARIA"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                  : lvl === "SECUNDARIA"
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              const lvlLabel = lvl ? lvl.charAt(0) + lvl.slice(1).toLowerCase() : null
              const subline = [gradeName, sectionName].filter(Boolean).join(" · ")
              return (
                <div key={c.id} className="sa-surface">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                      {courseName ?? "Curso sin nombre"}
                    </p>
                    {lvlLabel && (
                      <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${levelStyle}`}>
                        {lvlLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    {subline || "Grado y sección por asignar"}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
