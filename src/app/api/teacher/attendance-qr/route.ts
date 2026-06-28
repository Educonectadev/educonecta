import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, update, remove } from "@/lib/prisma"

export async function PATCH(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  try {
    const url = new URL(request.url)
    const id = Number(url.searchParams.get("id"))
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const confirmed = body?.confirmed !== false

    await update("Attendance", { id }, {
      confirmedByTeacher: confirmed,
      teacherId: session.user.teacherId,
      confirmedAt: new Date().toISOString(),
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[attendance-qr PATCH]", e)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  try {
    const url = new URL(request.url)
    const id = Number(url.searchParams.get("id"))
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })
    await remove("Attendance", { id })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}