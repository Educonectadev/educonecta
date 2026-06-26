"use client"

import Link from "next/link"
import { useState } from "react"
import Modal from "@/components/Modal"

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
    { label: "Comunicados", href: "/dashboard/teacher/comunicados", icon: "mail" },
    { label: "Horarios", href: "/dashboard/teacher/horarios", icon: "calendar_month" },
  ]

  const statCards = [
    { label: "Estudiantes", value: stats.totalStudents, icon: "group" },
    { label: "Tareas Activas", value: stats.activeHomework, icon: "assignment_turned_in" },
    { label: "Clases Hoy", value: stats.classesToday, icon: "schedule" },
    { label: "Cursos", value: stats.totalCourses, icon: "menu_book" },
  ]

  const studentCountByCourse = new Map<string, number>()
  for (const ct of courseTeachers) {
    const key = `${ct.courseId}-${ct.gradeId ?? "x"}-${ct.sectionId ?? "x"}`
    studentCountByCourse.set(key, (studentCountByCourse.get(key) ?? 0) + 0)
  }
  const scheduleByCourse = new Map<string, { day: string; time: string }[]>()
  for (const c of upcomingClasses) {
    const gradeId = (c as any).gradeId ?? c.grade?.id ?? "x"
    const sectionId = (c as any).sectionId ?? c.section?.id ?? "x"
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

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 min-h-[200px] sm:min-h-[240px] flex items-end">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative z-10 w-full p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="material-icons text-white/80 text-xl">person</span>
            </div>
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{institutionName || "Institución"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Hola, {teacherName}</h1>
          <p className="mt-1 text-sm text-white/60">Panel del Docente</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="group relative bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-black/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">{s.label}</span>
              <span className="material-icons text-lg text-gray-300 dark:text-zinc-600 group-hover:text-gray-400 dark:group-hover:text-zinc-400 transition-colors">{s.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white/90">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-icons text-base text-gray-400 dark:text-zinc-500">grid_view</span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Acceso rápido</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group flex flex-col items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-black/20 transition-all duration-200 min-h-[100px]"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-zinc-700 transition-colors">
                <span className="material-icons text-xl text-gray-500 dark:text-zinc-400">{l.icon}</span>
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div
          onClick={() => setCoursesOpen(true)}
          className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="material-icons text-base text-gray-400 dark:text-zinc-500">menu_book</span>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Mis Cursos</h2>
            </div>
            <span className="text-xs text-gray-400 dark:text-zinc-500">{courseTeachers.length} asignados · Ver tabla →</span>
          </div>
          {courseTeachers.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-6">No tienes cursos asignados.</p>
          ) : (
            <div className="space-y-1">
              {courseTeachers.slice(0, 6).map((ct) => (
                <div key={ct.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors -mx-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 dark:from-zinc-800 to-gray-200 dark:to-zinc-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-zinc-400">
                      {ct.course.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{ct.course.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-zinc-500">{ct.grade?.name ?? "—"} / {ct.section?.name ?? "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="material-icons text-base text-gray-400 dark:text-zinc-500">schedule</span>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Próximas Clases</h2>
            </div>
            <Link href="/dashboard/teacher/horarios" className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">Ver horario</Link>
          </div>
          {upcomingClasses.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-6">No tienes clases próximas.</p>
          ) : (
            <div className="space-y-1">
              {upcomingClasses.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors -mx-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-center shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">{dayLabels[c.dayOfWeek]}</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">{c.startTime}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{c.course.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-zinc-500">{c.grade?.name ?? "—"} · {c.section?.name ?? "—"}{c.classroom ? ` · ${c.classroom}` : ""}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {recentHomework.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="material-icons text-base text-gray-400 dark:text-zinc-500">assignment</span>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Tareas Recientes</h2>
            </div>
            <Link href="/dashboard/teacher/tareas" className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">Ver todas</Link>
          </div>
          <div className="space-y-1">
            {recentHomework.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors -mx-3">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{h.title}</p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500">{h.course.name} · {h.grade?.name ?? "—"} / {h.section?.name ?? "—"}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                  Vence {formatDate(h.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
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
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Curso</th>
                  <th className="px-4 py-3 text-left font-medium">Grado</th>
                  <th className="px-4 py-3 text-left font-medium">Sección</th>
                  <th className="px-4 py-3 text-left font-medium">Horario</th>
                </tr>
              </thead>
              <tbody>
                {courseTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-zinc-500">
                      No tienes cursos asignados.
                    </td>
                  </tr>
                ) : (
                  courseTeachers.map((ct) => (
                    <tr key={ct.id} className="border-t border-gray-100 dark:border-zinc-800">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white/90">{ct.course.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{ct.grade?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{ct.section?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300 text-xs">{scheduleLabel(ct)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCoursesOpen(false)}
              className="rounded-[30px] border border-gray-200 dark:border-zinc-700 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
            >
              Cerrar
            </button>
            <Link
              href="/dashboard/teacher/courses"
              className="rounded-[30px] btn-primary px-6 py-2.5 text-sm font-medium"
            >
              Pantalla Completa
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  )
}