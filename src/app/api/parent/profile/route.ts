import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const parentId = session.user.parentId!
  const userId = Number(session.user.id)

  const user = await query<any[]>(
    "SELECT id, email, name, role, createdAt FROM User WHERE id = ?",
    [userId]
  )

  const children = await query<any[]>(
    `SELECT s.id, s.firstName, s.lastName, s.documentId, s.email, s.phone, s.isActive,
            g.id AS g_id, g.name AS g_name, g.level AS g_level,
            sec.id AS sec_id, sec.name AS sec_name
     FROM Student s
     INNER JOIN ParentStudent ps ON ps.studentId = s.id
     LEFT JOIN Grade g ON s.gradeId = g.id
     LEFT JOIN Section sec ON s.sectionId = sec.id
     WHERE ps.parentId = ? AND s.institutionId = ?
     ORDER BY s.lastName, s.firstName`,
    [parentId, session.user.institutionId]
  )

  const studentIds = children.map((s) => s.id)
  const gradesByStudent: Record<number, any[]> = {}

  if (studentIds.length > 0) {
    const placeholders = studentIds.map(() => "?").join(",")
    const grades = await query<any[]>(
      `SELECT gr.*, c.name AS course_name
       FROM GradeRecord gr
       LEFT JOIN Course c ON gr.courseId = c.id
       WHERE gr.studentId IN (${placeholders})
       ORDER BY gr.studentId, gr.evaluationDate DESC`,
      studentIds
    )
    for (const g of grades) {
      if (!gradesByStudent[g.studentId]) gradesByStudent[g.studentId] = []
      gradesByStudent[g.studentId].push({
        id: g.id,
        courseName: g.course_name,
        grade: g.grade,
        evaluationName: g.evaluationName,
        evaluationDate: g.evaluationDate,
      })
    }
  }

  const passingGrade = 11

  const childrenData = children.map((s: any) => {
    const grades = gradesByStudent[s.id] ?? []
    const byCourse: Record<string, { grades: number[]; evaluations: any[] }> = {}
    for (const g of grades) {
      if (!byCourse[g.courseName]) byCourse[g.courseName] = { grades: [], evaluations: [] }
      byCourse[g.courseName].grades.push(g.grade)
      byCourse[g.courseName].evaluations.push(g)
    }
    const courseAverages = Object.entries(byCourse).map(([name, data]) => ({
      courseName: name,
      average: data.grades.reduce((a, b) => a + b, 0) / data.grades.length,
      evaluations: data.evaluations.length,
    }))
    const overallAverage = grades.length > 0
      ? grades.reduce((s: number, g: any) => s + g.grade, 0) / grades.length
      : null
    const passes = overallAverage !== null ? overallAverage >= passingGrade : null

    return {
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      documentId: s.documentId,
      email: s.email,
      phone: s.phone,
      isActive: !!s.isActive,
      grade: s.g_id ? { id: s.g_id, name: s.g_name, level: s.g_level } : null,
      section: s.sec_id ? { id: s.sec_id, name: s.sec_name } : null,
      grades: courseAverages,
      totalEvaluations: grades.length,
      overallAverage,
      passes,
    }
  })

  return NextResponse.json({
    user: user[0] ?? null,
    children: childrenData,
    passingGrade,
  })
}
