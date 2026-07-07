import { Suspense } from "react"
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import SecretaryDashboard from "./SecretaryDashboard"
import { DashboardSkeleton } from "@/components/DashboardSkeleton"

export const dynamic = "force-dynamic"

export default async function SecretaryDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY") redirect("/login")

  return (
    <Suspense fallback={<DashboardSkeleton sections={4} />}>
      <SecretaryDashboardData institutionId={session.user.institutionId!} />
    </Suspense>
  )
}

async function SecretaryDashboardData({ institutionId }: { institutionId: number }) {
  let studentCount = 0, parentCount = 0, courseCount = 0, pendingCount = 0
  let pendingEnrollments: any[] = []
  let institutionName = ""

  try {
    const [bundle, enrollments] = await Promise.all([
      query<any[]>(
        `SELECT
           (SELECT name FROM "Institution" WHERE id = ?) AS "institutionName",
           (SELECT COUNT(*)::int FROM "Student" WHERE "institutionId" = ?) AS "studentCount",
           (SELECT COUNT(*)::int FROM "Parent"  WHERE "institutionId" = ?) AS "parentCount",
           (SELECT COUNT(*)::int FROM "Course"  WHERE "institutionId" = ?) AS "courseCount",
           (SELECT COUNT(*)::int FROM "Enrollment" WHERE "institutionId" = ? AND status = 'pending') AS "pendingCount"`,
        [institutionId, institutionId, institutionId, institutionId, institutionId]
      ).catch(() => []),
      query<any[]>(
        `SELECT e.id, s."firstName" || ' ' || s."lastName" AS "studentName",
                g.name AS "gradeName", e.status
         FROM "Enrollment" e
         JOIN "Student" s ON s.id = e."studentId"
         LEFT JOIN "Grade" g ON g.id = e."gradeId"
         WHERE e."institutionId" = ? AND e.status = 'pending'
         ORDER BY e."createdAt" DESC
         LIMIT 5`,
        [institutionId]
      ).catch(() => []),
    ])

    const row = (bundle as any[])[0] ?? {}
    institutionName = row.institutionName ?? ""
    studentCount = Number(row.studentCount ?? 0)
    parentCount = Number(row.parentCount ?? 0)
    courseCount = Number(row.courseCount ?? 0)
    pendingCount = Number(row.pendingCount ?? 0)
    pendingEnrollments = enrollments as any[]
  } catch (e) {
    console.error("Secretary dashboard data fetch failed:", e)
  }

  const stats = [
    { label: "Alumnos", value: studentCount, href: "/dashboard/secretary/alumnos", icon: "group" },
    { label: "Padres", value: parentCount, href: "/dashboard/secretary/padres", icon: "diversity_3" },
    { label: "Cursos", value: courseCount, href: "/dashboard/secretary/cursos", icon: "book" },
    { label: "Pendientes", value: pendingCount, href: "/dashboard/secretary/matricula", icon: "inbox" },
  ]

  return (
    <SecretaryDashboard
      stats={stats}
      pendingEnrollments={pendingEnrollments}
      institutionName={institutionName}
    />
  )
}
