"use client"

import Link from "next/link"

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
}: {
  stats: Stat[]
  recentStudents: RecentStudent[]
  recentTeachers: RecentTeacher[]
  totalStudents: number
  totalTeachers: number
  totalParents: number
  totalCourses: number
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

  const statIcons: Record<string, string> = {
    "Alumnos": "group",
    "Profesores": "school",
    "Padres": "diversity_3",
    "Cursos": "book",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bienvenido</h1>
        <p className="mt-1.5 text-sm text-gray-500">Resumen general de la institución</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</span>
              <span className="material-icons text-lg text-gray-300 group-hover:text-gray-400 transition-colors">{statIcons[s.label] || "bar_chart"}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </Link>
        ))}
      </div>

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
