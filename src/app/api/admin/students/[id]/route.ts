import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query, execute, update, remove } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const studentRows = await query("SELECT * FROM Student WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (studentRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const student = studentRows[0]

  try {
    const body = await request.json()
    const { firstName, lastName, documentId, email, phone, gradeId, sectionId } = body

    if (documentId && documentId !== student.documentId) {
      const dup = await query("SELECT id FROM Student WHERE documentId = ? AND institutionId = ? AND id != ?", [documentId, institutionId, id])
      if (dup.length > 0) return NextResponse.json({ error: "Documento ya existe" }, { status: 409 })
    }

    await update("Student", { id }, {
      firstName: firstName ?? student.firstName,
      lastName: lastName ?? student.lastName,
      documentId: documentId ?? student.documentId,
      email: email !== undefined ? email : student.email,
      phone: phone !== undefined ? phone : student.phone,
      gradeId: gradeId !== undefined ? gradeId : student.gradeId,
      sectionId: sectionId !== undefined ? sectionId : student.sectionId,
    })

    const updated = await query(
      `SELECT s.*,
        CASE WHEN s.gradeId IS NOT NULL THEN JSON_OBJECT('id', g.id, 'name', g.name) ELSE NULL END AS grade,
        CASE WHEN s.sectionId IS NOT NULL THEN JSON_OBJECT('id', sec.id, 'name', sec.name) ELSE NULL END AS section
      FROM Student s
      LEFT JOIN Grade g ON s.gradeId = g.id
      LEFT JOIN Section sec ON s.sectionId = sec.id
      WHERE s.id = ?`,
      [id]
    )
    return NextResponse.json(updated[0])
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const studentRows = await query("SELECT id FROM Student WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (studentRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  try {
    await execute("DELETE FROM ParentStudent WHERE studentId = ?", [id])
    await execute("DELETE FROM Attendance WHERE studentId = ?", [id])
    await execute("DELETE FROM Tardiness WHERE studentId = ?", [id])
    await execute("DELETE FROM HomeworkSubmission WHERE studentId = ?", [id])
    await execute("DELETE FROM GradeRecord WHERE studentId = ?", [id])
    await execute("DELETE FROM Discipline WHERE studentId = ?", [id])
    await execute("DELETE FROM Notification WHERE studentId = ?", [id])
    await execute("DELETE FROM Enrollment WHERE studentId = ?", [id])
    await remove("Student", { id })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar: el estudiante tiene registros asociados" }, { status: 500 })
  }
}
