"use client"

import Link from "next/link"
import { getIcon } from "@/components/premium/iconRegistry"

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

function StatCard({ stat, max }: { stat: Stat; max: number }) {
  return (
    <Link
      href={stat.href}
      className="block bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-4"
    >
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
          {getIcon(stat.icon, { size: 20 })}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider truncate">
            {stat.label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {stat.value}
          </p>
        </div>
      </div>
      <div className="mt-3 h-1 rounded-full bg-[var(--surface-3)]">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${max > 0 ? (stat.value / max) * 100 : 0}%` }}
        />
      </div>
    </Link>
  )
}

export default function AdminDashboard({
  stats,
  recentStudents,
  recentTeachers,
  institutionName,
}: {
  stats: Stat[]
  recentStudents: RecentStudent[]
  recentTeachers: RecentTeacher[]
  institutionName?: string
}) {
  const maxStat = Math.max(1, ...stats.map((s) => s.value))

  return (
    <div className="space-y-4 py-4" data-tour="dashboard">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)] truncate">
            {institutionName || "Institución"}
          </p>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Panel del Director
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--muted-foreground)] shrink-0">
          {getIcon("calendar", { size: 14 })}
          <span className="whitespace-nowrap">{new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long" })}</span>
        </div>
      </div>

      {/* Metric stats */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} max={maxStat} />
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid gap-3">
        {/* Students */}
        <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                {getIcon("users", { size: 14 })}
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Alumnos</span>
            </div>
            <Link href="/dashboard/admin/alumnos" className="text-[11px] text-[var(--muted-foreground)] shrink-0 ml-2">
              Ver todo
            </Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-6">Sin alumnos registrados</p>
          ) : (
            <div className="space-y-1">
              {recentStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-2 py-1.5">
                  <div className="size-6 rounded-lg flex items-center justify-center text-[10px] font-semibold bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                    {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{s.firstName} {s.lastName}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] truncate">{s.grade?.name ?? ""} {s.section?.name ?? ""}</p>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)] bg-[var(--surface-3)] px-2 py-0.5 rounded-full shrink-0">
                    {s.documentId}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teachers */}
        <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                {getIcon("school", { size: 14 })}
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Docentes</span>
            </div>
            <Link href="/dashboard/admin/profesores" className="text-[11px] text-[var(--muted-foreground)] shrink-0 ml-2">
              Ver todo
            </Link>
          </div>
          {recentTeachers.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-6">Sin docentes registrados</p>
          ) : (
            <div className="space-y-1">
              {recentTeachers.map((t) => (
                <div key={t.id} className="flex items-center gap-2 py-1.5">
                  <div className="size-6 rounded-lg flex items-center justify-center text-[10px] font-semibold bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                    {t.user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{t.user.name}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] truncate">{t.user.email}</p>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)] bg-[var(--surface-3)] px-2 py-0.5 rounded-full shrink-0">
                    {t.speciality ?? "Docente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
