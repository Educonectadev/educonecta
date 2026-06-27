import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create, update } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const rows = await query(
    `SELECT s.*, i.name AS "institutionName", i.code AS "institutionCode", i.isActive AS "institutionActive"
     FROM "Subscription" s
     JOIN "Institution" i ON i.id = s."institutionId"
     ORDER BY s."updatedAt" DESC`
  )
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { institutionId, plan, pricePerParent, parentCount, monthlyAmount, expiresAt, notes } = body

    if (!institutionId || !plan) {
      return NextResponse.json({ error: "institutionId y plan son requeridos" }, { status: 400 })
    }
    if (!["ESENCIAL", "PROFESIONAL", "INSTITUCIONAL"].includes(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 })
    }

    const data = {
      institutionId: Number(institutionId),
      plan,
      pricePerParent: Number(pricePerParent ?? 2),
      parentCount: Number(parentCount ?? 0),
      monthlyAmount: Number(monthlyAmount ?? 0),
      expiresAt: expiresAt || null,
      notes: notes || null,
      isActive: true,
    }

    const existing = await query(
      `SELECT id FROM "Subscription" WHERE "institutionId" = ?`,
      [data.institutionId]
    )

    if (existing.length > 0) {
      await update("Subscription", { id: existing[0].id }, data)
    } else {
      await create("Subscription", data)
    }

    await update("Institution", { id: data.institutionId }, { currentPlan: data.plan })

    const sub = await query(
      `SELECT s.*, i.name AS "institutionName", i.code AS "institutionCode"
       FROM "Subscription" s
       JOIN "Institution" i ON i.id = s."institutionId"
       WHERE s."institutionId" = ?`,
      [data.institutionId]
    )

    return NextResponse.json(sub[0] ?? null, { status: 200 })
  } catch (e) {
    console.error("Error creating subscription:", e)
    return NextResponse.json({ error: "Error al guardar suscripción" }, { status: 500 })
  }
}