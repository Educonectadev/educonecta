"use client"

import Link from "next/link"
import { useState } from "react"
import Modal from "@/components/Modal"
import DataTable from "@/components/DataTable"
import { UnreadChatCount } from "@/components/UnreadChatCount"
import { PendingQrCount } from "@/components/PendingQrCount"
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars"
import { useTheme } from "@/components/ThemeProvider"
import { motion } from "framer-motion"
import { getIcon } from "@/components/premium/iconRegistry"

interface CourseTeacher {
  id: number
  courseId: number
  gradeId: number | null
  sectionId: number | null
  course: { id: number; name: string }
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

interface Stats {
  totalStudents: number
  activeHomework: number
  classesToday: number
  totalCourses: number
}

interface RecentHomework {
  id: number
  title: string
  dueDate: string | Date
  course: { name: string }
  grade: { name: string } | null
  section: { name: string } | null
}

interface UpcomingClass {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  courseId: number
  gradeId: number | null
  sectionId: number | null
  course: { id: number; name: string }
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
  classroom: string | null
}

const dayLabels: Record<number, string> = {
  1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes",
}

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

const saBtnMotion = { whileTap: { scale: 0.97 } }
const iconBtnMotion = { whileTap: { scale: 0.9 } }
const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
}

export default function TeacherDashboard({
  teacherName,
  institutionName,
  stats,
  courseTeachers,
  recentHomework,
  upcomingClasses,
}: {
  teacherName: string
  institutionName?: string
  stats: Stats
  courseTeachers: CourseTeacher[]
  recentHomework: RecentHomework[]
  upcomingClasses: UpcomingClass[]
}) {
  const [coursesOpen, setCoursesOpen] = useState(false)

const quickLinks = [
    { label: "Asistencia", href: "/dashboard/teacher/asistencia", icon: "fact_check" },
    { label: "Tareas", href: "/dashboard/teacher/tareas", icon: "assignment" },
    { label: "Notas", href: "/dashboard/teacher/calificaciones", icon: "grade" },
    { label: "Disciplina", href: "/dashboard/teacher/disciplina", icon: "gavel" },
    { label: "QR pendientes", href: "/dashboard/teacher/asistencia/qr", icon: "qr_code_scanner" },
    { label: "Mensajes", href: "/dashboard/teacher/mensajes", icon: "chat" },
  ]

  const statCards = [
    { label: "Estudiantes", value: stats.totalStudents, icon: "group" },
    { label: "Tareas Activas", value: stats.activeHomework, icon: "fact_check" },
    { label: "Clases Hoy", value: stats.classesToday, icon: "clock" },
    { label: "Cursos", value: stats.totalCourses, icon: "menu_book" },
  ]

  const scheduleByCourse = new Map<string, { day: string; time: string }[]>()
  for (const c of upcomingClasses) {
    const gradeId = c.gradeId ?? c.grade?.id ?? "x"
    const sectionId = c.sectionId ?? c.section?.id ?? "x"
    const key = `${c.courseId}-${gradeId}-${sectionId}`
    const list = scheduleByCourse.get(key) ?? []
    list.push({ day: dayLabels[c.dayOfWeek] ?? "—", time: `${c.startTime}-${c.endTime}` })
    scheduleByCourse.set(key, list)
  }
  function scheduleLabel(ct: CourseTeacher) {
    const key = `${ct.courseId}-${ct.gradeId ?? "x"}-${ct.sectionId ?? "x"}`
    const list = scheduleByCourse.get(key) ?? []
    if (list.length === 0) return "—"
    return list.slice(0, 2).map((s) => `${s.day} ${s.time}`).join(", ") + (list.length > 2 ? "…" : "")
  }

  const { theme } = useTheme()
  const starColor = theme === "dark" ? "#ffffff" : "#000000"

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="dashboard">
      <motion.div {...cardMotion} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 via-gray-50 to-[var(--surface)] dark:from-gray-900 dark:via-gray-800 dark:to-[var(--surface)] min-h-[200px] sm:min-h-[240px] flex items-end">
        <StarsBackground className="absolute inset-0" starColor={starColor} pointerEvents={false} />
        <div className="relative z-10 w-full p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
              {getIcon("person", { className: "text-xl", style: { color: "var(--muted-foreground)" } })}
            </div>
            <span className="sa-eyebrow">{institutionName || "Institución"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Hola, {teacherName}</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Panel del Docente</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: idx * 0.05 }}
            className="sa-tile"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="sa-eyebrow">{s.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                {getIcon(s.icon, { className: "text-sm", style: { color: "var(--muted-foreground)" } })}
              </div>
            </div>
            <p className="sa-num text-3xl" style={{ color: "var(--foreground)" }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          {getIcon("grid", { className: "text-base", style: { color: "var(--muted-foreground)" } })}
          <span className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Acceso rápido</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickLinks.map((l, idx) => (
            <motion.div
              key={l.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: idx * 0.025 }}
              {...iconBtnMotion}
            >
              <Link
                href={l.href}
                className="sa-surface group flex flex-col items-center justify-center gap-2 p-4 min-h-[100px]"
              >
                {l.label === "Mensajes" && <UnreadChatCount role="TEACHER" />}
                {l.label === "QR pendientes" && <PendingQrCount />}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ background: "var(--surface-2)" }}>
                  {getIcon(l.icon, { className: "text-xl", style: { color: "var(--muted-foreground)" } })}
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{l.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          {...cardMotion}
          onClick={() => setCoursesOpen(true)}
          className="sa-surface cursor-pointer"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {getIcon("menu_book", { className: "text-base", style: { color: "var(--muted-foreground)" } })}
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Mis Cursos</h2>
            </div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{courseTeachers.length} asignados · Ver tabla →</span>
          </div>
          {courseTeachers.length === 0 ? (
            <div className="sa-surface-flat py-14 md:py-16 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                {getIcon("menu_book", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No tienes cursos asignados.</p>
              <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>Los cursos aparecerán aquí cuando sean asignados por el administrador.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {courseTeachers.slice(0, 6).map((ct) => (
                <div key={ct.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors -mx-3" style={{ borderColor: "var(--surface-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium" style={{ background: "var(--surface-3)", color: "var(--muted-foreground)" }}>
                      {ct.course.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{ct.course.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{ct.grade?.name ?? "—"} / {ct.section?.name ?? "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          {...cardMotion}
          className="sa-surface"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {getIcon("clock", { className: "text-base", style: { color: "var(--muted-foreground)" } })}
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Próximas Clases</h2>
            </div>
            <Link href="/dashboard/teacher/horarios" className="text-xs transition-colors" style={{ color: "var(--muted-foreground)" }}>Ver horario</Link>
          </div>
          {upcomingClasses.length === 0 ? (
            <div className="sa-surface-flat py-14 md:py-16 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                {getIcon("clock", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No tienes clases próximas.</p>
              <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>Las clases del día de hoy aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingClasses.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors -mx-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-center shrink-0">
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{dayLabels[c.dayOfWeek]}</p>
                      <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{c.startTime}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.course.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{c.grade?.name ?? "—"} · {c.section?.name ?? "—"}{c.classroom ? ` · ${c.classroom}` : ""}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {recentHomework.length > 0 && (
        <motion.div
          {...cardMotion}
          className="sa-surface"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {getIcon("assignment", { className: "text-base", style: { color: "var(--muted-foreground)" } })}
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Tareas Recientes</h2>
            </div>
            <Link href="/dashboard/teacher/tareas" className="text-xs transition-colors" style={{ color: "var(--muted-foreground)" }}>Ver todas</Link>
          </div>
          <div className="space-y-1">
            {recentHomework.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors -mx-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{h.title}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{h.course.name} · {h.grade?.name ?? "—"} / {h.section?.name ?? "—"}</p>
                </div>
                <span className="sa-chip" style={{ color: "var(--muted-foreground)", background: "var(--surface-3)" }}>
                  Vence {formatDate(h.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <Modal
        open={coursesOpen}
        onClose={() => setCoursesOpen(false)}
        title="Mis Cursos"
        size="lg"
        scroll="inside"
        dialogClassName="max-w-6xl w-full"
        bodyClassName="h-[85vh] overflow-y-auto"
      >
        <div className="space-y-4">
          <DataTable
            data={courseTeachers.map((ct) => ({
              id: ct.id,
              courseName: ct.course.name,
              courseCode: ct.course.id,
              grade: ct.grade?.name ?? null,
              section: ct.section?.name ?? null,
              schedule: scheduleLabel(ct),
            }))}
            emptyMessage="No tienes cursos asignados."
            columns={[
              {
                key: "courseName",
                label: "Curso",
                sortable: true,
                render: (r) => (
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{r.courseName}</p>
                    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Código: {r.courseCode}</p>
                  </div>
                ),
              },
              {
                key: "grade",
                label: "Grado",
                sortable: false,
                render: (r) => <span className="text-sm" style={{ color: "var(--foreground)" }}>{r.grade ?? "—"}</span>,
              },
              {
                key: "section",
                label: "Sección",
                sortable: false,
                render: (r) => <span className="text-sm" style={{ color: "var(--foreground)" }}>{r.section ?? "—"}</span>,
              },
              {
                key: "schedule",
                label: "Horario",
                sortable: false,
                render: (r) => <span className="text-xs" style={{ color: "var(--foreground)" }}>{r.schedule}</span>,
              },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCoursesOpen(false)}
              className="sa-btn sa-btn-ghost text-sm"
            >
              Cerrar
            </button>
            <Link
              href="/dashboard/teacher/courses"
              className="sa-btn sa-btn-primary text-sm"
            >
              Pantalla Completa
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  )
}
