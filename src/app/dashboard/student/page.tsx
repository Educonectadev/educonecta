import { Suspense } from "react"
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import StudentDashboardClient from "./StudentDashboardClient"
import { DashboardSkeleton } from "@/components/DashboardSkeleton"

export default async function StudentHome() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT") redirect("/login")

  const studentId = session.user.studentId
  if (!studentId) {
    return <UnlinkedAccount />
  }

  return (
    <Suspense fallback={<DashboardSkeleton sections={4} />}>
      <StudentDashboardData studentId={studentId} institutionId={session.user.institutionId} userName={session.user.name} />
    </Suspense>
  )
}

function UnlinkedAccount() {
  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <div className="sa-surface py-14 md:py-16 text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
          <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Mi cuenta aún no está vinculada</p>
        <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>
          Tu administrador aún no ha asociado esta cuenta a un alumno. Pídele que complete el registro.
        </p>
      </div>
    </div>
  )
}

async function StudentDashboardData({ studentId, institutionId, userName }: { studentId: number; institutionId?: number | null; userName: string }) {
  const [student, courses, homework, grades, attendance, communications] = await Promise.all([
    query(
      `SELECT s.id, s."firstName", s."lastName", s.email,
              CASE WHEN s."gradeId" IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name) ELSE NULL END AS grade,
              CASE WHEN s."sectionId" IS NOT NULL THEN jsonb_build_object('id', sec.id, 'name', sec.name) ELSE NULL END AS section
       FROM Student s
       LEFT JOIN Grade g ON s."gradeId" = g.id
       LEFT JOIN Section sec ON s."sectionId" = sec.id
       WHERE s.id = ?`,
      [studentId]
    ),
    query<any[]>(
      `SELECT ct.id, ct."courseId", ct."gradeId", ct."sectionId",
              c.name AS "courseName", c.code AS "courseCode"
       FROM "CourseTeacher" ct
       JOIN Course c ON c.id = ct."courseId"
       WHERE (ct."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
              OR ct."gradeId" IS NULL)
         AND (ct."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
              OR ct."sectionId" IS NULL)
       ORDER BY c.name`,
      [studentId, studentId]
    ),
    query<any[]>(
      `SELECT h.id, h.title, h."dueDate", h."courseId",
              c.name AS "courseName"
       FROM Homework h
       JOIN Course c ON c.id = h."courseId"
       WHERE (h."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
              OR h."gradeId" IS NULL)
         AND (h."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
              OR h."sectionId" IS NULL)
       ORDER BY h."dueDate" ASC
       LIMIT 8`,
      [studentId, studentId]
    ),
    query<any[]>(
      `SELECT gr.id, gr."evaluationName", gr.grade, gr."evaluationDate",
              c.name AS "courseName"
       FROM "GradeRecord" gr
       JOIN Course c ON c.id = gr."courseId"
       WHERE gr."studentId" = ?
       ORDER BY gr."evaluationDate" DESC NULLS LAST, gr.id DESC
       LIMIT 8`,
      [studentId]
    ),
    query<any[]>(
      `SELECT a.id, a.date, a."isPresent", a.note, c.name AS "courseName"
       FROM Attendance a
       LEFT JOIN Course c ON c.id = (
         SELECT ct."courseId" FROM "CourseTeacher" ct
         WHERE ct."teacherId" = a."teacherId" LIMIT 1
       )
       WHERE a."studentId" = ?
       ORDER BY a.date DESC
       LIMIT 10`,
      [studentId]
    ),
    query<any[]>(
      `SELECT id, title, content, type, priority, "createdAt"
       FROM Communication
       WHERE "institutionId" = ?
         AND ("teacherId" IS NULL OR "teacherId" IN (
           SELECT DISTINCT ct."teacherId" FROM "CourseTeacher" ct
           WHERE (ct."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
                  OR ct."gradeId" IS NULL)
             AND (ct."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
                  OR ct."sectionId" IS NULL)
         ))
       ORDER BY "createdAt" DESC
       LIMIT 5`,
      [institutionId ?? 0, studentId, studentId]
    ),
  ])

  const s = (student as any[])[0] ?? {}
  const fullName = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || userName

  const totalAttendance = (attendance as any[]).length
  const presentes = (attendance as any[]).filter((a) => a.isPresent).length
  const asistenciaPct = totalAttendance > 0 ? Math.round((presentes / totalAttendance) * 100) : null

  const calificaciones = (grades as any[]).filter((g) => g.grade != null)
  const promedio = calificaciones.length > 0
    ? calificaciones.reduce((acc, g) => acc + Number(g.grade), 0) / calificaciones.length
    : null

  const tareasPendientes = (homework as any[]).filter((h) => new Date(h.dueDate) >= new Date())

  return (
    <StudentDashboardClient
      fullName={fullName}
      gradeName={s.grade?.name ?? null}
      sectionName={s.section?.name ?? null}
      courseCount={(courses as any[]).length}
      pendingHomeworkCount={tareasPendientes.length}
      promedio={promedio}
      asistenciaPct={asistenciaPct}
      tareasPendientes={tareasPendientes}
      communications={communications as any[]}
    />
  )
}
