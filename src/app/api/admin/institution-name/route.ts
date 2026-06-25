import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const institutionId = session.user.institutionId
  if (!institutionId) return NextResponse.json({ name: "" })

  const rows = await query("SELECT name FROM Institution WHERE id = ?", [institutionId])
  const name = (rows as any[])[0]?.name ?? ""
  return NextResponse.json({ name })
}
