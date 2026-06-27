import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const id = Number((await params).id)
  const lead = await query(`SELECT * FROM "Lead" WHERE id = ?`, [id])
  if (lead.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const messages = await query(
    `SELECT * FROM "LeadMessage" WHERE "leadId" = ? ORDER BY "createdAt" ASC`,
    [id]
  )
  return NextResponse.json({ lead: lead[0], messages })
}