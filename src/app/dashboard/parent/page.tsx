import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getParentChildren, getChildrenHomeworks, getChildrenGrades, getChildrenAttendance } from "@/lib/parent-data"

export default async function ParentDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

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
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
      <p className="mt-1 text-sm text-gray-500">
        Bienvenido, {session.user.name}
      </p>

      {children.length === 0 && (
        <div className="mt-12 text-center text-gray-400">
          No hay estudiantes vinculados a su cuenta.
        </div>
      )}

      {children.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-[25px] p-5 text-center">
            <p className="text-2xl font-bold text-[#1a1a1a]">{children.length}</p>
            <p className="text-xs text-gray-400 mt-1">Hijos</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[25px] p-5 text-center">
            <p className="text-2xl font-bold text-[#1a1a1a]">{totalPending}</p>
            <p className="text-xs text-gray-400 mt-1">Tareas pendientes</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[25px] p-5 text-center">
            <p className="text-2xl font-bold text-[#1a1a1a]">{totalGrades}</p>
            <p className="text-xs text-gray-400 mt-1">Notas registradas</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[25px] p-5 text-center">
            <p className="text-2xl font-bold text-[#1a1a1a]">
              {attendanceRate !== null ? `${attendanceRate}%` : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Asistencia</p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              className="bg-white border border-gray-100 rounded-[25px] p-6 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {child.firstName} {child.lastName}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {child.grade?.name ?? "—"} · {child.section?.name ?? "—"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-sm font-medium">
                  {child.firstName[0]}{child.lastName[0]}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5 text-center">
                <div>
                  <p className="text-xl font-bold">{pendingHw}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Pendientes</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{avgGrade ?? "—"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Promedio</p>
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {attPct !== null ? `${attPct}%` : "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Asistencia</p>
                </div>
              </div>

              {attPct !== null && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Asistencia</span>
                    <span>{presentCount}/{totalAtt} días</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1a1a1a] rounded-full transition-all"
                      style={{ width: `${attPct}%` }}
                    />
                  </div>
                </div>
              )}

              {recentGrades.length > 0 && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Últimas notas
                  </p>
                  <div className="space-y-2">
                    {recentGrades.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-500 truncate mr-2">{g.course.name}</span>
                        <span className="font-medium shrink-0">{g.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <Link
                  href="/padre/tareas"
                  className="flex-1 text-center text-xs rounded-[30px] bg-gray-50 border border-gray-200 py-2 text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Tareas
                </Link>
                <Link
                  href="/padre/calificaciones"
                  className="flex-1 text-center text-xs rounded-[30px] bg-gray-50 border border-gray-200 py-2 text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Notas
                </Link>
                <Link
                  href="/padre/asistencia"
                  className="flex-1 text-center text-xs rounded-[30px] bg-gray-50 border border-gray-200 py-2 text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Asistencia
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 animate-fade-in-up">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Más secciones</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/padre/perfil"
            className="flex flex-col items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-[25px] p-5 hover:bg-amber-100 transition-all duration-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm font-medium text-amber-600">Perfil</span>
          </Link>
          <Link
            href="/padre/horarios"
            className="flex flex-col items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-[25px] p-5 hover:bg-gray-100 transition-all duration-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Horarios</span>
          </Link>
          <Link
            href="/padre/disciplina"
            className="flex flex-col items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-[25px] p-5 hover:bg-gray-100 transition-all duration-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Disciplina</span>
          </Link>
          <Link
            href="/padre/notificaciones"
            className="flex flex-col items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-[25px] p-5 hover:bg-gray-100 transition-all duration-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Notificaciones</span>
          </Link>
          <Link
            href="/padre/comunicados"
            className="flex flex-col items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-[25px] p-5 hover:bg-gray-100 transition-all duration-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Comunicados</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
