import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const parentId = session.user.parentId!

  const rows = await query<any[]>(
    `SELECT ps.relationship,
            s.id, s.firstName, s.lastName, s.documentId, s.email, s.phone,
            s.institutionId, s.isActive, s.gradeId, s.sectionId,
            g.id AS grade__id, g.name AS grade__name, g.level AS grade__level,
            sec.id AS section__id, sec.name AS section__name, sec.capacity AS section__capacity
     FROM ParentStudent ps
     INNER JOIN Student s ON s.id = ps.studentId
     LEFT JOIN Grade g ON g.id = s.gradeId
     LEFT JOIN Section sec ON sec.id = s.sectionId
     WHERE ps.parentId = ?`,
    [parentId]
  )

  if (rows.length === 0) {
    return NextResponse.json([])
  }

  const students = rows.map((r) => {
    const { grade__id, grade__name, grade__level, section__id, section__name, section__capacity, relationship, gradeId, sectionId, ...student } = r
    return {
      ...student,
      relationship,
      grade: grade__id ? { id: grade__id, name: grade__name, level: grade__level } : null,
      section: section__id ? { id: section__id, name: section__name, capacity: section__capacity } : null,
    }
  })

  return NextResponse.json(students)
}
