"use client"

import Link from "next/link"
import { useState } from "react"

interface Stat {
  label: string
  value: number
  href: string
  icon: string
}

interface RecentStudent {
  id: number
  firstName: string
  lastName: string
  documentId: string
  grade: { name: string } | null
  section: { name: string } | null
}

interface RecentTeacher {
  id: number
  user: { name: string; email: string }
  speciality: string | null
}

export default function AdminDashboard({
  stats,
  recentStudents,
  recentTeachers,
  totalStudents,
  totalTeachers,
  totalParents,
  totalCourses,
  institutionName,
}: {
  stats: Stat[]
  recentStudents: RecentStudent[]
  recentTeachers: RecentTeacher[]
  totalStudents: number
  totalTeachers: number
  totalParents: number
  totalCourses: number
  institutionName?: string
}) {
  const quickLinks = [
    { label: "Alumnos", href: "/dashboard/admin/alumnos", count: totalStudents, icon: "group" },
    { label: "Profesores", href: "/dashboard/admin/profesores", count: totalTeachers, icon: "school" },
    { label: "Padres", href: "/dashboard/admin/padres", count: totalParents, icon: "diversity_3" },
    { label: "Cursos", href: "/dashboard/admin/cursos", count: totalCourses, icon: "book" },
    { label: "Grados", href: "/dashboard/admin/grados", count: null, icon: "layers" },
    { label: "Horarios", href: "/dashboard/admin/horarios", count: null, icon: "calendar_month" },
    { label: "Aulas", href: "/dashboard/admin/aulas", count: null, icon: "meeting_room" },
  ]

  const teachers = recentTeachers.slice(0, 6)
  const [teacherIdx, setTeacherIdx] = useState(0)

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 min-h-[200px] sm:min-h-[240px] flex items-end">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative z-10 w-full p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="material-icons text-white/80 text-xl">school</span>
            </div>
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{institutionName || "Institución"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Bienvenido</h1>
          <p className="mt-1 text-sm text-white/60">Panel de Administración</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</span>
              <span className="material-icons text-lg text-gray-300 group-hover:text-gray-400 transition-colors">{s.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Teacher carousel */}
      {teachers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-icons text-base text-gray-400">people</span>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Nuestros Docentes</h2>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setTeacherIdx(Math.max(0, teacherIdx - 1))} disabled={teacherIdx === 0} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all material-icons text-sm text-gray-500">chevron_left</button>
              <button onClick={() => setTeacherIdx(Math.min(teachers.length - 3, teacherIdx + 1))} disabled={teacherIdx >= teachers.length - 3} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all material-icons text-sm text-gray-500">chevron_right</button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <div className="flex gap-3 transition-transform duration-300" style={{ transform: `translateX(-${teacherIdx * (160 + 12)}px)` }}>
              {teachers.map((t) => (
                <div key={t.id} className="shrink-0 w-[160px] bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-semibold text-gray-500 mx-auto mb-3">
                    {t.user.name.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 text-center truncate">{t.user.name}</p>
                  <p className="text-[11px] text-gray-400 text-center truncate">{t.speciality || "Docente"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-icons text-base text-gray-400">grid_view</span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Acceso rápido</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group flex flex-col items-center justify-center gap-2 bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200 min-h-[100px]"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <span className="material-icons text-xl text-gray-500">{l.icon}</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">{l.label}</span>
              {l.count !== null && <span className="text-[10px] text-gray-400">{l.count} registrados</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="material-icons text-base text-gray-400">person</span>
              <h2 className="text-sm font-semibold text-gray-700">Últimos Alumnos</h2>
            </div>
            <Link href="/dashboard/admin/alumnos" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Ver todos</Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No hay alumnos registrados.</p>
          ) : (
            <div className="space-y-1">
              {recentStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors -mx-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.firstName} {s.lastName}</p>
                      <p className="text-[11px] text-gray-400">{s.documentId}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{s.grade?.name ?? "—"} {s.section?.name ?? ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="material-icons text-base text-gray-400">school</span>
              <h2 className="text-sm font-semibold text-gray-700">Últimos Profesores</h2>
            </div>
            <Link href="/dashboard/admin/profesores" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Ver todos</Link>
          </div>
          {recentTeachers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No hay profesores registrados.</p>
          ) : (
            <div className="space-y-1">
              {recentTeachers.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors -mx-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      {t.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.user.name}</p>
                      <p className="text-[11px] text-gray-400">{t.user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{t.speciality ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
