import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, update, remove } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const id = Number((await params).id)
  try {
    const body = await request.json()
    const { isActive } = body
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive requerido" }, { status: 400 })
    }
    await update("Subscription", { id }, { isActive })
    if (!isActive) {
      const sub = await query(`SELECT "institutionId" FROM "Subscription" WHERE id = ?`, [id])
      if (sub[0]) {
        await update("Institution", { id: sub[0].institutionId }, { currentPlan: null })
      }
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const id = Number((await params).id)
  try {
    const sub = await query(`SELECT "institutionId" FROM "Subscription" WHERE id = ?`, [id])
    await remove("Subscription", { id })
    if (sub[0]) {
      await update("Institution", { id: sub[0].institutionId }, { currentPlan: null })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}