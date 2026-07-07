"use client"

import Link from "next/link"
import { getIcon } from "@/components/premium/iconRegistry"

interface Stat {
  label: string
  value: number
  href: string
  icon: string
}

interface PendingEnrollment {
  id: number
  studentName: string
  gradeName: string
  status: string
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

export default function SecretaryDashboard({
  stats,
  pendingEnrollments,
  institutionName,
}: {
  stats: Stat[]
  pendingEnrollments: PendingEnrollment[]
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
            Panel de Secretaría
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--muted-foreground)] shrink-0">
          {getIcon("calendar", { size: 14 })}
          <span className="whitespace-nowrap">{new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long" })}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link
          href="/dashboard/secretary/matricula"
          className="flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-full text-sm font-medium shrink-0"
        >
          {getIcon("plus", { size: 16 })}
          Nueva matrícula
        </Link>
        <Link
          href="/dashboard/secretary/alumnos"
          className="flex items-center gap-2 bg-[var(--surface-2)] text-[var(--foreground)] px-4 py-2 rounded-full text-sm font-medium shrink-0 border border-[var(--surface-border)]"
        >
          {getIcon("users", { size: 16 })}
          Ver alumnos
        </Link>
        <Link
          href="/dashboard/secretary/carga-masiva"
          className="flex items-center gap-2 bg-[var(--surface-2)] text-[var(--foreground)] px-4 py-2 rounded-full text-sm font-medium shrink-0 border border-[var(--surface-border)]"
        >
          {getIcon("upload", { size: 16 })}
          Carga masiva
        </Link>
      </div>

      {/* Metric stats */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} max={maxStat} />
        ))}
      </div>

      {/* Pending enrollments */}
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
              {getIcon("inbox", { size: 14 })}
            </div>
            <span className="text-xs font-semibold text-[var(--foreground)]">Matrículas pendientes</span>
          </div>
          <Link href="/dashboard/secretary/matricula" className="text-[11px] text-[var(--muted-foreground)] shrink-0 ml-2">
            Ver todo
          </Link>
        </div>
        {pendingEnrollments.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center py-6">Sin matrículas pendientes</p>
        ) : (
          <div className="space-y-1">
            {pendingEnrollments.map((e) => (
              <div key={e.id} className="flex items-center gap-2 py-1.5">
                <div className="size-6 rounded-lg flex items-center justify-center text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                  {e.studentName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{e.studentName}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)] truncate">{e.gradeName}</p>
                </div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full shrink-0">
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
