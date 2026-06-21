import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query, count } from "@/lib/prisma"
import AdminDashboard from "./AdminDashboard"

export default async function AdminDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const [studentCount, teacherCount, parentCount, courseCount, studentsData, teachersData] = await Promise.all([
    count("Student", { institutionId }),
    count("Teacher", { institutionId }),
    count("Parent", { institutionId }),
    count("Course", { institutionId }),
    query<any[]>(
      "SELECT s.*, g.name as gradeName, sec.name as sectionName FROM Student s LEFT JOIN Grade g ON g.id = s.gradeId LEFT JOIN Section sec ON sec.id = s.sectionId WHERE s.institutionId = ? ORDER BY s.createdAt DESC LIMIT 5",
      [institutionId]
    ),
    query<any[]>(
      "SELECT t.*, u.name as userName, u.email as userEmail FROM Teacher t LEFT JOIN User u ON u.id = t.userId WHERE t.institutionId = ? ORDER BY t.createdAt DESC LIMIT 5",
      [institutionId]
    ),
  ])

  const students = studentsData.map((s) => ({
    ...s,
    grade: s.gradeName ? { name: s.gradeName } : null,
    section: s.sectionName ? { name: s.sectionName } : null,
  }))

  const teachers = teachersData.map((t) => ({
    id: t.id,
    speciality: t.speciality,
    user: { name: t.userName, email: t.userEmail },
  }))

  const stats = [
    { label: "Alumnos", value: studentCount, href: "/dashboard/admin/alumnos", icon: "▤" },
    { label: "Profesores", value: teacherCount, href: "/dashboard/admin/profesores", icon: "▥" },
    { label: "Padres", value: parentCount, href: "/dashboard/admin/padres", icon: "▣" },
    { label: "Cursos", value: courseCount, href: "/dashboard/admin/cursos", icon: "◇" },
  ]

  return (
    <AdminDashboard
      stats={stats}
      recentStudents={students}
      recentTeachers={teachers}
      totalStudents={studentCount}
      totalTeachers={teacherCount}
      totalParents={parentCount}
      totalCourses={courseCount}
    />
  )
}
