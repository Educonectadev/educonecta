import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"
import { getIcon } from "@/components/premium/iconRegistry"

export default async function AsistenciaPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const ctData = await query<any[]>(
    "SELECT ct.*, c.id as c_id, c.name as c_name, g.id as g_id, g.name as g_name, sec.id as sec_id, sec.name as sec_name FROM CourseTeacher ct LEFT JOIN Course c ON c.id = ct.courseId LEFT JOIN Grade g ON g.id = ct.gradeId LEFT JOIN Section sec ON sec.id = ct.sectionId WHERE ct.teacherId = ?",
    [teacherId]
  )

  const courseTeachers = ctData.map((ct) => ({
    id: ct.id,
    courseId: ct.courseId,
    gradeId: ct.gradeId,
    sectionId: ct.sectionId,
    course: { id: ct.c_id, name: ct.c_name },
    grade: ct.g_id ? { id: ct.g_id, name: ct.g_name } : null,
    section: ct.sec_id ? { id: ct.sec_id, name: ct.sec_name } : null,
  }))

  const attendanceData = await query<any[]>(
    "SELECT a.*, s.firstName as s_firstName, s.lastName as s_lastName FROM Attendance a LEFT JOIN Student s ON s.id = a.studentId WHERE a.teacherId = ? ORDER BY a.date DESC LIMIT 20",
    [teacherId]
  )

  const recentAttendance = attendanceData.map((a) => ({
    id: a.id,
    date: a.date,
    isPresent: !!a.isPresent,
    note: a.note,
    student: { firstName: a.s_firstName, lastName: a.s_lastName },
  }))

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="attendance">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Docente / Asistencia</p>
          <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Asistencia</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{courseTeachers.length} cursos disponibles</p>
        </div>
      </header>

      <section>
        <div className="flex items-center gap-2 mb-4">
          {getIcon("fact_check", { className: "text-base", style: { color: "var(--muted-foreground)" } })}
          <span className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Tomar Asistencia</span>
        </div>
        {courseTeachers.length === 0 ? (
          <div className="sa-surface py-14 md:py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
              {getIcon("fact_check", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No tienes cursos asignados para tomar asistencia.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {courseTeachers.map((ct: { id: number; courseId: number; gradeId: number | null; sectionId: number | null; course: { name: string }; grade: { name: string } | null; section: { name: string } | null }) => (
              <Link
                key={ct.id}
                href={`/dashboard/teacher/asistencia/tomar?courseId=${ct.courseId}&gradeId=${ct.gradeId ?? ""}&sectionId=${ct.sectionId ?? ""}`}
                className="sa-surface group"
              >
                <div className="flex items-center justify-between mb-3">
                  {getIcon("arrow_right", { className: "text-base", style: { color: "var(--muted-foreground)" } })}
                </div>
                <p className="font-semibold" style={{ color: "var(--foreground)" }}>{ct.course.name}</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {ct.grade?.name ?? "—"} / {ct.section?.name ?? "—"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          {getIcon("history", { className: "text-base", style: { color: "var(--muted-foreground)" } })}
          <span className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Registros Recientes</span>
        </div>
        {recentAttendance.length === 0 ? (
          <div className="sa-surface py-14 md:py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
              {getIcon("history", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin registros.</p>
            <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>Los registros de asistencia aparecerán aquí cuando tomes asistencia.</p>
          </div>
        ) : (
          <div className="sa-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="hidden md:table-header-group border-b" style={{ borderColor: "var(--surface-border)", background: "var(--surface-2)" }}>
                <tr className="text-left">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>Estudiante</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>Fecha</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>Presente</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>Nota</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((a: { id: number; date: string | Date; isPresent: boolean; note: string | null; student: { firstName: string; lastName: string } }) => {
                  const dateStr = typeof a.date === "string" ? a.date : a.date.toISOString().substring(0, 10)
                  const dateObj = new Date(dateStr)
                  return (
                  <tr key={a.id} className="flex flex-col md:table-row border md:border-0 rounded-2xl p-4 md:p-0 mb-3 md:mb-0 transition-colors" style={{ borderColor: "var(--surface-border)" }}>
                    <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3 font-medium" style={{ color: "var(--foreground)" }}>
                      <span className="md:hidden text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Estudiante</span>
                      <span>{a.student.firstName} {a.student.lastName}</span>
                    </td>
                    <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3" style={{ color: "var(--muted-foreground)" }}>
                      <span className="md:hidden text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Fecha</span>
                      <span>{dateObj.toLocaleDateString("es-ES")}</span>
                    </td>
                    <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                      <span className="md:hidden text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Presente</span>
                      <span className={`sa-chip text-[11px] font-semibold uppercase tracking-wider ${
                        a.isPresent
                          ? ""
                          : ""
                      }`} style={a.isPresent ? { color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)" } : { color: "var(--muted-foreground)", background: "var(--surface-3)" }}>
                        {a.isPresent ? "Presente" : "Ausente"}
                      </span>
                    </td>
                    <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3" style={{ color: "var(--muted-foreground)" }}>
                      <span className="md:hidden text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Nota</span>
                      <span>{a.note ?? "—"}</span>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
