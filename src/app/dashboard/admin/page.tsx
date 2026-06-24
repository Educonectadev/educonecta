import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { count, findMany } from "@/lib/prisma"
import AdminDashboard from "./AdminDashboard"

export default async function AdminDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const [studentCount, teacherCount, parentCount, courseCount, students, teachers] = await Promise.all([
    count("Student", { institutionId }),
    count("Teacher", { institutionId }),
    count("Parent", { institutionId }),
    count("Course", { institutionId }),
    findMany("Student", { where: { institutionId }, orderBy: "createdAt", orderDir: "DESC", limit: 5 }),
    findMany("Teacher", { where: { institutionId }, orderBy: "createdAt", orderDir: "DESC", limit: 5 }),
  ])

  const stats = [
    { label: "Alumnos", value: studentCount, href: "/dashboard/admin/alumnos", icon: "▤" },
    { label: "Profesores", value: teacherCount, href: "/dashboard/admin/profesores", icon: "▥" },
    { label: "Padres", value: parentCount, href: "/dashboard/admin/padres", icon: "▣" },
    { label: "Cursos", value: courseCount, href: "/dashboard/admin/cursos", icon: "◇" },
  ]

  return (
    <AdminDashboard
      stats={stats}
      recentStudents={students as any[]}
      recentTeachers={teachers as any[]}
      totalStudents={studentCount}
      totalTeachers={teacherCount}
      totalParents={parentCount}
      totalCourses={courseCount}
    />
  )
}
