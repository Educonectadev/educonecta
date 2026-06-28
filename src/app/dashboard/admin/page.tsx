import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { count, query, findOne } from "@/lib/prisma"
import AdminDashboard from "./AdminDashboard"

export default async function AdminDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  let studentCount = 0, teacherCount = 0, parentCount = 0, courseCount = 0
  let students: any[] = [], teachers: any[] = [], carouselImages: any[] = []
  let institutionName = ""

  try {
    const institution = await findOne("Institution", { id: institutionId })
    institutionName = (institution as any)?.name ?? ""

    const results = await Promise.allSettled([
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
         JOIN "User" u ON t.userId = u.id
         WHERE t.institutionId = ?
         ORDER BY t.createdAt DESC
         LIMIT 5`,
        [institutionId]
      ),
      query(
        `SELECT id, url, alt FROM "InstitutionCarouselImage"
         WHERE "institutionId" = ? ORDER BY "order" ASC, "createdAt" ASC LIMIT 12`,
        [institutionId]
      ),
    ])

    if (results[0].status === "fulfilled") studentCount = results[0].value
    else console.error("studentCount failed:", results[0].reason)
    if (results[1].status === "fulfilled") teacherCount = results[1].value
    else console.error("teacherCount failed:", results[1].reason)
    if (results[2].status === "fulfilled") parentCount = results[2].value
    else console.error("parentCount failed:", results[2].reason)
    if (results[3].status === "fulfilled") courseCount = results[3].value
    else console.error("courseCount failed:", results[3].reason)
    if (results[4].status === "fulfilled") students = results[4].value
    else console.error("students query failed:", results[4].reason)
    if (results[5].status === "fulfilled") teachers = results[5].value
    else console.error("teachers query failed:", results[5].reason)
    if (results[6].status === "fulfilled") carouselImages = results[6].value
    else console.error("carousel query failed:", results[6].reason)
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
      recentStudents={students as any[]}
      recentTeachers={teachers as any[]}
      totalStudents={studentCount}
      totalTeachers={teacherCount}
      totalParents={parentCount}
      totalCourses={courseCount}
      institutionName={institutionName}
      carouselImages={carouselImages as any[]}
    />
  )
}
