import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { authOptions } from "@/lib/auth"
import { query, execute, create, update, remove } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const parentRows = await query(
    `SELECT p.*, JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
    FROM Parent p
    JOIN User u ON p.userId = u.id
    WHERE p.id = ? AND p.institutionId = ?`,
    [id, institutionId]
  )
  if (parentRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const parent = parentRows[0]

  try {
    const body = await request.json()
    const { firstName, lastName, password, phone, studentIds } = body

    const userData: Record<string, unknown> = {}
    if (firstName || lastName) {
      userData.name = `${firstName?.trim() ?? ""} ${lastName?.trim() ?? ""}`.trim()
    }
    if (phone !== undefined) userData.phone = phone
    if (password) userData.passwordHash = await bcrypt.hash(password, 10)

    if (Object.keys(userData).length > 0) {
      await update("User", { id: parent.userId }, userData)
    }

    if (studentIds !== undefined) {
      await execute("DELETE FROM ParentStudent WHERE parentId = ?", [id])
      if (Array.isArray(studentIds) && studentIds.length > 0) {
        for (const studentId of studentIds) {
          await create("ParentStudent", { parentId: id, studentId })
        }
      }
    }

    const updated = await query(
      `SELECT p.*,
        JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT('id', ps.id, 'parentId', ps.parentId, 'studentId', ps.studentId, 'student', JSON_OBJECT('id', st.id, 'firstName', st.firstName, 'lastName', st.lastName, 'documentId', st.documentId))
          ),
          JSON_ARRAY()
        ) AS children
      FROM Parent p
      JOIN User u ON p.userId = u.id
      LEFT JOIN ParentStudent ps ON ps.parentId = p.id
      LEFT JOIN Student st ON ps.studentId = st.id
      WHERE p.id = ?
      GROUP BY p.id`,
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

  const parentRows = await query("SELECT * FROM Parent WHERE id = ? AND institutionId = ?", [id, institutionId])
  if (parentRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const parent = parentRows[0]

  try {
    await execute("DELETE FROM ParentStudent WHERE parentId = ?", [id])
    await execute("DELETE FROM Notification WHERE parentId = ?", [id])
    await remove("Parent", { id })
    await remove("User", { id: parent.userId })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar: el padre tiene registros asociados" }, { status: 500 })
  }
}
