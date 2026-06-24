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

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Panel de Administración</h1>
      <p className="mt-1 text-sm text-gray-500">Resumen general de la institución</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-blue-50 border border-blue-200 rounded-[25px] p-5 hover:bg-blue-100 transition-all duration-200"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#1a1a1a]">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-4">Acceso rápido</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="flex flex-col items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-[25px] p-4 hover:bg-blue-100 transition-all duration-200 min-h-[90px]"
            >
              <span className="material-icons text-3xl text-blue-500">{l.icon}</span>
              <span className="text-sm font-semibold text-blue-700">{l.label}</span>
              {l.count !== null && <span className="text-[11px] text-blue-400">{l.count} registrados</span>}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="bg-blue-50 border border-blue-200 rounded-[25px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight">Últimos Alumnos</h2>
            <Link href="/dashboard/admin/alumnos" className="text-xs text-blue-500 hover:text-blue-700 transition-all">Ver todos</Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-blue-400">No hay alumnos registrados.</p>
          ) : (
            <div className="space-y-2">
              {recentStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">{s.firstName} {s.lastName}</span>
                  <span className="text-xs text-blue-400">{s.grade?.name ?? "—"} {s.section?.name ?? ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-[25px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight">Últimos Profesores</h2>
            <Link href="/dashboard/admin/profesores" className="text-xs text-blue-500 hover:text-blue-700 transition-all">Ver todos</Link>
          </div>
          {recentTeachers.length === 0 ? (
            <p className="text-sm text-blue-400">No hay profesores registrados.</p>
          ) : (
            <div className="space-y-2">
              {recentTeachers.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">{t.user.name}</span>
                  <span className="text-xs text-blue-400">{t.speciality ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
