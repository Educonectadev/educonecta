import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { count, query } from "@/lib/prisma"
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
    query(
      `SELECT s.id, s.firstName, s.lastName, s.documentId,
              jsonb_build_object('name', g.name) AS grade,
              jsonb_build_object('name', sec.name) AS section
       FROM Student s
       LEFT JOIN Grade g ON s.gradeId = g.id
       LEFT JOIN Section sec ON s.sectionId = sec.id
       WHERE s.institutionId = ?
       ORDER BY s.createdAt DESC
       LIMIT 5`,
      [institutionId]
    ),
    query(
      `SELECT t.id, t.speciality,
              jsonb_build_object('name', u.name, 'email', u.email) AS "user"
       FROM Teacher t
       JOIN User u ON t.userId = u.id
       WHERE t.institutionId = ?
       ORDER BY t.createdAt DESC
       LIMIT 5`,
      [institutionId]
    ),
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
