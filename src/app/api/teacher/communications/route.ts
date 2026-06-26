import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create, findOne } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
    const rows = await query<any[]>(
      `SELECT c.*, u.id AS author__id, u.email AS author__email, u.name AS author__name, u.role AS author__role, u.phone AS author__phone
       FROM Communication c INNER JOIN User u ON u.id = c.authorId
       WHERE c.teacherId = ?
       ORDER BY c.createdAt DESC
       LIMIT 50`,
      [teacherId]
    )

    const communications = rows.map((r) => {
      const { author__id, author__email, author__name, author__role, author__phone, ...rest } = r
      return {
        ...rest,
        author: {
          id: author__id,
          email: author__email,
          name: author__name,
          role: author__role,
          phone: author__phone,
        },
      }
    })

    return NextResponse.json({ success: true, data: communications })
  } catch (error) {
    console.error("Error fetching communications:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
    const userId = Number(session.user.id)
    const institutionId = session.user.institutionId!

    const { title, content, type, priority } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ success: false, message: "Datos incompletos" }, { status: 400 })
    }

    const insertId = await create("Communication", {
      title,
      content,
      type: type ?? "general",
      priority: priority ?? "normal",
      authorId: userId,
      teacherId,
      institutionId,
    })

    try {
      const { broadcastCommunicationToParents } = await import("@/lib/push-events")
      await broadcastCommunicationToParents({
        institutionId,
        teacherId,
        title,
      })
    } catch (err) {
      console.error("[communication push]", err)
    }

    const communication = await findOne("Communication", { id: insertId })

    return NextResponse.json({ success: true, data: communication })
  } catch (error) {
    console.error("Error creating communication:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}
