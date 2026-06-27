import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, update } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const url = new URL(request.url)
  const since = url.searchParams.get("since")

  if (since) {
    // Polling ligero: solo leads actualizados después de `since`
    try {
      const rows = await query(
        `SELECT id, status, "unreadByAdmin", "updatedAt"
         FROM "Lead" WHERE "updatedAt" > ? ORDER BY "updatedAt" DESC LIMIT 100`,
        [since]
      )
      return NextResponse.json({ leads: rows, serverTime: new Date().toISOString() })
    } catch {
      return NextResponse.json({ leads: [], serverTime: new Date().toISOString() })
    }
  }

  const leads = await query(
    `SELECT * FROM "Lead" ORDER BY
       CASE WHEN status = 'NUEVO' THEN 0 ELSE 1 END,
       "createdAt" DESC LIMIT 200`
  )
  return NextResponse.json({ leads, serverTime: new Date().toISOString() })
}

export async function PATCH(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { id, status, unreadByAdmin } = body
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })

    const data: Record<string, unknown> = {}
    if (status && ["NUEVO", "EN_CONTACTO", "CERRADO"].includes(status)) data.status = status
    if (typeof unreadByAdmin === "boolean") data.unreadByAdmin = unreadByAdmin
    data.updatedAt = new Date().toISOString()

    await update("Lead", { id: Number(id) }, data)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}