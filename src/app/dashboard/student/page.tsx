import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { query } from "@/lib/prisma"
import { motion } from "framer-motion"

export default async function StudentHome() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT") redirect("/login")

  const studentId = session.user.studentId
  if (!studentId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-5 md:space-y-6 pt-3 md:pt-6"
      >
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Mi cuenta aún no está vinculada</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>
            Tu administrador aún no ha asociado esta cuenta a un alumno. Pídele que complete el registro.
          </p>
        </div>
      </motion.div>
    )
  }

  const [student, courses, homework, grades, attendance, communications] = await Promise.all([
    query(
      `SELECT s.id, s."firstName", s."lastName", s.email,
              CASE WHEN s."gradeId" IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name) ELSE NULL END AS grade,
              CASE WHEN s."sectionId" IS NOT NULL THEN jsonb_build_object('id', sec.id, 'name', sec.name) ELSE NULL END AS section
       FROM Student s
       LEFT JOIN Grade g ON s."gradeId" = g.id
       LEFT JOIN Section sec ON s."sectionId" = sec.id
       WHERE s.id = ?`,
      [studentId]
    ),
    query<any[]>(
      `SELECT ct.id, ct."courseId", ct."gradeId", ct."sectionId",
              c.name AS "courseName", c.code AS "courseCode"
       FROM "CourseTeacher" ct
       JOIN Course c ON c.id = ct."courseId"
       WHERE (ct."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
              OR ct."gradeId" IS NULL)
         AND (ct."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
              OR ct."sectionId" IS NULL)
       ORDER BY c.name`,
      [studentId, studentId]
    ),
    query<any[]>(
      `SELECT h.id, h.title, h."dueDate", h."courseId",
              c.name AS "courseName"
       FROM Homework h
       JOIN Course c ON c.id = h."courseId"
       WHERE (h."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
              OR h."gradeId" IS NULL)
         AND (h."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
              OR h."sectionId" IS NULL)
       ORDER BY h."dueDate" ASC
       LIMIT 8`,
      [studentId, studentId]
    ),
    query<any[]>(
      `SELECT gr.id, gr."evaluationName", gr.grade, gr."evaluationDate",
              c.name AS "courseName"
       FROM "GradeRecord" gr
       JOIN Course c ON c.id = gr."courseId"
       WHERE gr."studentId" = ?
       ORDER BY gr."evaluationDate" DESC NULLS LAST, gr.id DESC
       LIMIT 8`,
      [studentId]
    ),
    query<any[]>(
      `SELECT a.id, a.date, a."isPresent", a.note, c.name AS "courseName"
       FROM Attendance a
       LEFT JOIN Course c ON c.id = (
         SELECT ct."courseId" FROM "CourseTeacher" ct
         WHERE ct."teacherId" = a."teacherId" LIMIT 1
       )
       WHERE a."studentId" = ?
       ORDER BY a.date DESC
       LIMIT 10`,
      [studentId]
    ),
    query<any[]>(
      `SELECT id, title, content, type, priority, "createdAt"
       FROM Communication
       WHERE "institutionId" = ?
         AND ("teacherId" IS NULL OR "teacherId" IN (
           SELECT DISTINCT ct."teacherId" FROM "CourseTeacher" ct
           WHERE (ct."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
                  OR ct."gradeId" IS NULL)
             AND (ct."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
                  OR ct."sectionId" IS NULL)
         ))
       ORDER BY "createdAt" DESC
       LIMIT 5`,
      [session.user.institutionId ?? 0, studentId, studentId]
    ),
  ])

  const s = (student as any[])[0] ?? {}
  const fullName = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || session.user.name

  const totalAttendance = (attendance as any[]).length
  const presentes = (attendance as any[]).filter((a) => a.isPresent).length
  const asistenciaPct = totalAttendance > 0 ? Math.round((presentes / totalAttendance) * 100) : null

  const calificaciones = (grades as any[]).filter((g) => g.grade != null)
  const promedio = calificaciones.length > 0
    ? calificaciones.reduce((acc, g) => acc + Number(g.grade), 0) / calificaciones.length
    : null

  const tareasPendientes = (homework as any[]).filter((h) => new Date(h.dueDate) >= new Date())

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5 md:space-y-6 pt-3 md:pt-6"
    >
      <header>
        <p className="sa-eyebrow" style={{ color: "#8b5cf6" }}>Bienvenido</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>{fullName}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {s.grade?.name ?? "Sin grado"}{s.section?.name ? ` · Sección ${s.section.name}` : ""}
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cursos" value={(courses as any[]).length} accent="#8b5cf6" />
        <StatCard label="Tareas pendientes" value={tareasPendientes.length} accent="#d97706" />
        <StatCard label="Promedio" value={promedio !== null ? promedio.toFixed(2) : "—"} accent="#10b981" />
        <StatCard label="Asistencia" value={asistenciaPct !== null ? `${asistenciaPct}%` : "—"} accent="#06b6d4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="sa-surface lg:col-span-2 p-5 md:p-6"
        >
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Próximas tareas</h2>
            <Link href="/dashboard/student/tareas" className="text-xs hover:underline" style={{ color: "#8b5cf6" }}>Ver todas →</Link>
          </header>
          {tareasPendientes.length === 0 ? (
            <div className="sa-surface py-14 md:py-16 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
              <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Sin tareas pendientes</p>
              <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No tienes tareas pendientes.</p>
            </div>
          ) : (
            <ul className="divide-y sa-divider">
              {tareasPendientes.slice(0, 5).map((h: any) => (
                <li key={h.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{h.title}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{h.courseName}</p>
                  </div>
                  <span className="shrink-0 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(h.dueDate).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="sa-surface p-5 md:p-6"
        >
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Avisos</h2>
            <Link href="/dashboard/student/comunicados" className="text-xs hover:underline" style={{ color: "#8b5cf6" }}>Ver todos →</Link>
          </header>
          {(communications as any[]).length === 0 ? (
            <div className="sa-surface py-14 md:py-16 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Sin avisos</p>
              <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Sin avisos recientes.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {(communications as any[]).slice(0, 4).map((c: any, idx: number) => (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  className="text-sm"
                >
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>{c.title}</p>
                  <p className="text-xs line-clamp-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>{c.content}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sa-tile"
    >
      <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      <p className="mt-2 sa-num text-2xl md:text-3xl" style={{ color: accent }}>{value}</p>
    </motion.div>
  )
}
