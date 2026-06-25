import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { query, execute, update, remove } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const teacherRows = await query(
    `SELECT t.*, jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
    FROM Teacher t
    JOIN User u ON t.userId = u.id
    WHERE t.id = ? AND t.institutionId = ?`,
    [id, institutionId]
  )
  if (teacherRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const teacher = teacherRows[0]

  try {
    const body = await request.json()
    const { firstName, lastName, password, phone, speciality, documentId, professionalTitle, educationLevel, hireDate, address, contractType, emergencyContactName, emergencyContactPhone } = body

    const userData: Record<string, unknown> = {}
    if (firstName || lastName) {
      userData.name = `${firstName?.trim() ?? ""} ${lastName?.trim() ?? ""}`.trim()
    }
    if (phone !== undefined) userData.phone = phone
    if (password) userData.passwordHash = await bcrypt.hash(password, 10)

    if (Object.keys(userData).length > 0) {
      await update("User", { id: (teacher as any).userId }, userData)
    }

    await update("Teacher", { id }, {
      speciality: speciality !== undefined ? speciality : (teacher as any).speciality,
      documentId: documentId !== undefined ? documentId : (teacher as any).documentId,
      title: professionalTitle !== undefined ? professionalTitle : (teacher as any).title,
      educationLevel: educationLevel !== undefined ? educationLevel : (teacher as any).educationLevel,
      hireDate: hireDate !== undefined ? hireDate : (teacher as any).hireDate,
      address: address !== undefined ? address : (teacher as any).address,
      contractType: contractType !== undefined ? contractType : (teacher as any).contractType,
      emergencyContact: emergencyContactName !== undefined ? emergencyContactName : (teacher as any).emergencyContact,
      emergencyPhone: emergencyContactPhone !== undefined ? emergencyContactPhone : (teacher as any).emergencyPhone,
    })

    const updated = await query(
      `SELECT t.*,
        jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
      FROM Teacher t
      JOIN User u ON t.userId = u.id
      WHERE t.id = ?`,
      [id]
    )
    return NextResponse.json(updated[0])
  } catch (e) {
    console.error("Error updating teacher:", e)
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const teacherRows = await query("SELECT * FROM Teacher WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (teacherRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const teacher = teacherRows[0]

  try {
    await execute("DELETE FROM CourseTeacher WHERE teacherId = ?", [id])
    await execute("DELETE FROM Attendance WHERE teacherId = ?", [id])
    await execute("DELETE FROM GradeRecord WHERE teacherId = ?", [id])
    await execute("DELETE FROM Discipline WHERE teacherId = ?", [id])
    await execute("DELETE FROM Homework WHERE teacherId = ?", [id])
    await execute("DELETE FROM Communication WHERE teacherId = ?", [id])
    await remove("Teacher", { id })
    await remove("User", { id: teacher.userId })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar: el profesor tiene registros asociados" }, { status: 500 })
  }
}
