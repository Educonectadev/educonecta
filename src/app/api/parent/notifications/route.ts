import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query, findOne, update } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const parentId = session.user.parentId!

  const rows = await query<any[]>(
    `SELECT n.*, s.id AS student__id, s.firstName AS student__firstName, s.lastName AS student__lastName
     FROM Notification n
     LEFT JOIN Student s ON s.id = n.studentId
     WHERE n.userId = ? OR n.parentId = ?
     ORDER BY n.createdAt DESC`,
    [userId, parentId]
  )

  const notifications = rows.map((r) => {
    const { student__id, student__firstName, student__lastName, ...rest } = r
    return {
      ...rest,
      student: student__id ? { id: student__id, firstName: student__firstName, lastName: student__lastName } : null,
    }
  })

  return NextResponse.json(notifications)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id, action } = await req.json()

  if (!id || !action) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  const userId = parseInt(session.user.id)
  const parentId = session.user.parentId!

  const notification = await findOne("Notification", { id })

  if (!notification) {
    return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 })
  }

  const isOwner =
    (notification as any).userId === userId || (notification as any).parentId === parentId
  if (!isOwner) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  if (action === "read") {
    await update("Notification", { id }, { isRead: true, readAt: new Date() })
  } else if (action === "confirm") {
    await update("Notification", { id }, { isRead: true, readAt: new Date(), confirmedAt: new Date() })
  } else {
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
