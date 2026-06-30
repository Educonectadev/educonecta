import { Suspense } from "react"
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getParentChildren, getChildrenHomeworks, getChildrenGrades, getChildrenAttendance } from "@/lib/parent-data"
import { DashboardSkeleton } from "@/components/DashboardSkeleton"

export default async function ParentDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

  return (
    <Suspense fallback={<DashboardSkeleton sections={3} />}>
      <ParentDashboardContent session={session} />
    </Suspense>
  )
}

async function ParentDashboardContent({ session }: { session: NonNullable<Awaited<ReturnType<typeof getServerSession>>> }) {
  const parentId = session.user.parentId!
  const parent = await getParentChildren(parentId)
  if (!parent) redirect("/login")

  const children = parent.children.map((ps) => ps.student)
  const studentIds = children.map((s) => s.id)
  const gradeIds = children.map((s) => s.gradeId).filter(Boolean) as number[]
  const sectionIds = children.map((s) => s.sectionId).filter(Boolean) as number[]

  const [homeworksByStudent, gradesByStudent, attendanceByStudent] = await Promise.all([
    gradeIds.length && sectionIds.length
      ? getChildrenHomeworks(studentIds, gradeIds, sectionIds)
      : Promise.resolve({} as Awaited<ReturnType<typeof getChildrenHomeworks>>),
    getChildrenGrades(studentIds),
    getChildrenAttendance(studentIds),
  ])

  const totalPending = studentIds.reduce((sum, id) => {
    const hws = homeworksByStudent[id] ?? []
    return sum + hws.filter((hw) => {
      const sub = hw.submissions.find((s: any) => s.studentId === id)
      return !sub || !sub.submitted
    }).length
  }, 0)

  const totalGrades = studentIds.reduce((sum, id) => {
    return sum + (gradesByStudent[id]?.length ?? 0)
  }, 0)

  let totalPresent = 0
  let totalAttendance = 0
  for (const id of studentIds) {
    const records = attendanceByStudent[id] ?? []
    totalPresent += records.filter((a) => a.isPresent).length
    totalAttendance += records.length
  }
  const attendanceRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : null

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Panel de Control</p>
        <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Panel de Control</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Bienvenido, {session.user.name}
        </p>
      </header>

      {children.length === 0 && (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin estudiantes vinculados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay estudiantes vinculados a su cuenta.</p>
        </div>
      )}

      {children.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="sa-tile text-center">
            <p className="sa-num text-3xl" style={{ color: "var(--foreground)" }}>{children.length}</p>
            <p className="sa-eyebrow mt-1" style={{ color: "var(--muted-foreground)" }}>Hijos</p>
          </div>
          <div className="sa-tile text-center">
            <p className="sa-num text-3xl" style={{ color: "var(--foreground)" }}>{totalPending}</p>
            <p className="sa-eyebrow mt-1" style={{ color: "var(--muted-foreground)" }}>Tareas pendientes</p>
          </div>
          <div className="sa-tile text-center">
            <p className="sa-num text-3xl" style={{ color: "var(--foreground)" }}>{totalGrades}</p>
            <p className="sa-eyebrow mt-1" style={{ color: "var(--muted-foreground)" }}>Notas registradas</p>
          </div>
          <div className="sa-tile text-center">
            <p className="sa-num text-3xl" style={{ color: "var(--foreground)" }}>
              {attendanceRate !== null ? `${attendanceRate}%` : "—"}
            </p>
            <p className="sa-eyebrow mt-1" style={{ color: "var(--muted-foreground)" }}>Asistencia</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => {
          const pendingHw = (homeworksByStudent[child.id] ?? []).filter(
            (hw) => {
              const sub = hw.submissions.find((s: any) => s.studentId === child.id)
              return !sub || !sub.submitted
            }
          ).length

          const grades = gradesByStudent[child.id] ?? []
          const recentGrades = grades.slice(0, 5)
          const avgGrade = grades.length > 0
            ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1)
            : null

          const attendance = attendanceByStudent[child.id] ?? []
          const presentCount = attendance.filter((a) => a.isPresent).length
          const totalAtt = attendance.length
          const attPct = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : null

          return (
            <div
              key={child.id}
              className="sa-surface p-6 sa-surface-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
                    {child.firstName} {child.lastName}
                  </h2>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {child.grade?.name ?? "—"} &middot; {child.section?.name ?? "—"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: "var(--foreground)", color: "var(--surface)" }}>
                  {child.firstName[0]}{child.lastName[0]}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 pt-5 text-center" style={{ borderTop: "1px solid var(--surface-border)" }}>
                <div>
                  <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{pendingHw}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Pendientes</p>
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{avgGrade ?? "—"}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Promedio</p>
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                    {attPct !== null ? `${attPct}%` : "—"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Asistencia</p>
                </div>
              </div>

              {attPct !== null && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                    <span>Asistencia</span>
                    <span>{presentCount}/{totalAtt} d&iacute;as</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${attPct}%`, background: "var(--foreground)" }}
                    />
                  </div>
                </div>
              )}

              {recentGrades.length > 0 && (
                <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--surface-border)" }}>
                  <p className="mb-3 sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>
                    &Uacute;ltimas notas
                  </p>
                  <div className="space-y-2">
                    {recentGrades.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate mr-2" style={{ color: "var(--muted-foreground)" }}>{g.course.name}</span>
                        <span className="font-medium shrink-0" style={{ color: "var(--foreground)" }}>{g.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <Link
                  href="/dashboard/parent/tareas"
                  className="flex-1 text-center text-xs sa-btn sa-btn-ghost"
                >
                  Tareas
                </Link>
                <Link
                  href="/dashboard/parent/calificaciones"
                  className="flex-1 text-center text-xs sa-btn sa-btn-ghost"
                >
                  Notas
                </Link>
                <Link
                  href="/dashboard/parent/asistencia"
                  className="flex-1 text-center text-xs sa-btn sa-btn-ghost"
                >
                  Asistencia
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <div>
        <p className="sa-eyebrow mb-4" style={{ color: "var(--muted-foreground)" }}>M&aacute;s secciones</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard/parent/perfil"
            className="flex flex-col items-center justify-center gap-2 sa-surface p-5 sa-surface-hover"
            style={{ background: "rgba(217, 119, 6, 0.06)", borderColor: "rgba(217, 119, 6, 0.2)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#d97706" }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm font-medium" style={{ color: "#d97706" }}>Perfil</span>
          </Link>
          <Link
            href="/dashboard/parent/horarios"
            className="flex flex-col items-center justify-center gap-2 sa-surface p-5 sa-surface-hover"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Horarios</span>
          </Link>
          <Link
            href="/dashboard/parent/disciplina"
            className="flex flex-col items-center justify-center gap-2 sa-surface p-5 sa-surface-hover"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Disciplina</span>
          </Link>
          <Link
            href="/dashboard/parent/notificaciones"
            className="flex flex-col items-center justify-center gap-2 sa-surface p-5 sa-surface-hover"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Notificaciones</span>
          </Link>
          <Link
            href="/dashboard/parent/comunicados"
            className="flex flex-col items-center justify-center gap-2 sa-surface p-5 sa-surface-hover"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Comunicados</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
