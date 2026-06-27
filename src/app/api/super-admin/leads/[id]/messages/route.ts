import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { create, query, update } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const leadId = Number((await params).id)
  const url = new URL(request.url)
  const since = url.searchParams.get("since")
  if (since) {
    const messages = await query(
      `SELECT * FROM "LeadMessage" WHERE "leadId" = ? AND "createdAt" > ? ORDER BY "createdAt" ASC`,
      [leadId, since]
    )
    return NextResponse.json({ messages, serverTime: new Date().toISOString() })
  }
  const messages = await query(
    `SELECT * FROM "LeadMessage" WHERE "leadId" = ? ORDER BY "createdAt" ASC`,
    [leadId]
  )
  return NextResponse.json({ messages })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  try {
    const leadId = Number((await params).id)
    const body = await request.json()
    const text = (body?.body ?? "").toString().trim()
    if (!text) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })

    const created = await create("LeadMessage", {
      leadId,
      authorRole: "ADMIN",
      authorName: session.user.name ?? "Equipo EduConecta",
      body: text.slice(0, 4000),
      readByAdmin: true,
    })

    await update("Lead", { id: leadId }, { status: "EN_CONTACTO", updatedAt: new Date().toISOString() })

    const msg = await query(`SELECT * FROM "LeadMessage" WHERE id = ?`, [created])
    return NextResponse.json({ message: msg[0] }, { status: 201 })
  } catch (e) {
    console.error("[lead messages POST]", e)
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 })
  }
}