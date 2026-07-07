import { Suspense } from "react"
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import AdminDashboard from "./AdminDashboard"
import { DashboardSkeleton } from "@/components/DashboardSkeleton"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  return (
    <Suspense fallback={<DashboardSkeleton sections={4} />}>
      <AdminDashboardData institutionId={session.user.institutionId!} />
    </Suspense>
  )
}

async function AdminDashboardData({ institutionId }: { institutionId: number }) {
  let studentCount = 0, teacherCount = 0, parentCount = 0, courseCount = 0
  let carouselImages: any[] = []
  let institutionName = ""

  try {
    const [bundle, carousel] = await Promise.all([
      query<any[]>(
        `SELECT
           (SELECT name FROM "Institution" WHERE id = ?) AS "institutionName",
           (SELECT COUNT(*)::int FROM "Student"  WHERE "institutionId" = ?) AS "studentCount",
           (SELECT COUNT(*)::int FROM "Teacher"  WHERE "institutionId" = ?) AS "teacherCount",
           (SELECT COUNT(*)::int FROM "Parent"   WHERE "institutionId" = ?) AS "parentCount",
           (SELECT COUNT(*)::int FROM "Course"   WHERE "institutionId" = ?) AS "courseCount"`,
        [institutionId, institutionId, institutionId, institutionId, institutionId]
      ).catch(() => []),
      query<any[]>(
        `SELECT id, url, alt FROM "InstitutionCarouselImage"
         WHERE "institutionId" = ? ORDER BY "order" ASC, "createdAt" ASC LIMIT 12`,
        [institutionId]
      ).catch(() => []),
    ])

    const row = (bundle as any[])[0] ?? {}
    institutionName = row.institutionName ?? ""
    studentCount = Number(row.studentCount ?? 0)
    teacherCount = Number(row.teacherCount ?? 0)
    parentCount = Number(row.parentCount ?? 0)
    courseCount = Number(row.courseCount ?? 0)
    carouselImages = carousel as any[]
  } catch (e) {
    console.error("Dashboard data fetch failed:", e)
  }

  const stats = [
    { label: "Alumnos", value: studentCount, href: "/dashboard/admin/alumnos", icon: "group" },
    { label: "Profesores", value: teacherCount, href: "/dashboard/admin/profesores", icon: "school" },
    { label: "Padres", value: parentCount, href: "/dashboard/admin/padres", icon: "diversity_3" },
    { label: "Cursos", value: courseCount, href: "/dashboard/admin/cursos", icon: "book" },
  ]

  return (
    <AdminDashboard
      stats={stats}
      institutionName={institutionName}
      carouselImages={carouselImages as any[]}
    />
  )
}
