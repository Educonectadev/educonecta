import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create } from "@/lib/prisma"
import { broadcastPushToUsers } from "@/lib/push-broadcast"

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(request.url)
  const since = url.searchParams.get("since")
  const studentId = url.searchParams.get("studentId")

  const role = session.user.role
  const userId = Number(session.user.id)

  let where = ""
  const params: any[] = []
  if (role === "PARENT") {
    where = "WHERE m.\"parentUserId\" = ?"
    params.push(userId)
  } else if (role === "TEACHER") {
    where = "WHERE m.\"teacherUserId\" = ?"
    params.push(userId)
  } else {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (studentId) {
    where += " AND m.\"studentId\" = ?"
    params.push(studentId)
  }

  if (since) {
    where += " AND m.\"createdAt\" > ?"
    params.push(since)
  }

  const messages = await query(
    `SELECT m.* FROM "ParentTeacherMessage" m ${where} ORDER BY m."createdAt" ASC LIMIT 500`,
    params
  )

  return NextResponse.json({ messages, serverTime: new Date().toISOString() })
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const body = await request.json()
    const text = String(body?.body ?? "").trim()
    if (!text) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })

    const role = session.user.role
    const userId = Number(session.user.id)
    if (role !== "PARENT" && role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    let parentUserId: number
    let teacherUserId: number
    let studentId: number | null = body.studentId ? Number(body.studentId) : null

    if (role === "PARENT") {
      parentUserId = userId
      teacherUserId = Number(body.teacherUserId)
      if (!teacherUserId) return NextResponse.json({ error: "teacherUserId requerido" }, { status: 400 })
    } else {
      teacherUserId = userId
      parentUserId = Number(body.parentUserId)
      if (!parentUserId) return NextResponse.json({ error: "parentUserId requerido" }, { status: 400 })
    }

    const id = await create("ParentTeacherMessage", {
      parentUserId,
      teacherUserId,
      studentId,
      fromRole: role,
      fromName: session.user.name ?? null,
      body: text.slice(0, 4000),
      readByParent: role !== "TEACHER",
      readByTeacher: role !== "PARENT",
    })

    const msg = await query(`SELECT * FROM "ParentTeacherMessage" WHERE id = ?`, [id])

    try {
      const targetUserId = role === "PARENT" ? teacherUserId : parentUserId
      await broadcastPushToUsers([targetUserId], {
        title: role === "PARENT" ? "👨‍👩‍👧 Mensaje al docente" : "👨‍🏫 Mensaje del apoderado",
        body: text.slice(0, 100),
        url: role === "TEACHER" ? "/dashboard/parent/mensajes" : "/dashboard/teacher/mensajes",
        tag: `ptm-${id}`,
      })
    } catch (e) {
      console.warn("[parent/teacher msg] push failed:", e)
    }

    return NextResponse.json({ message: msg[0] }, { status: 201 })
  } catch (e) {
    console.error("[parent/teacher msg POST]", e)
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 })
  }
}