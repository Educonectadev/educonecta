import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create, remove } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const institutionId = session.user.institutionId!
    const rows = await query<any[]>(
      `SELECT id, url, alt, "order"
       FROM "InstitutionCarouselImage"
       WHERE "institutionId" = ?
       ORDER BY "order" ASC, "createdAt" ASC`,
      [institutionId]
    )
    return NextResponse.json(rows)
  } catch (e: any) {
    console.error("[carousel GET]", e?.message ?? e)
    return NextResponse.json({ error: "Error al listar" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const institutionId = session.user.institutionId!
    const body = await request.json()
    const url = String(body?.url ?? "").trim()
    const alt = body?.alt ? String(body.alt).trim().slice(0, 200) : null

    if (!url) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 })
    }
    if (url.length > 2_000_000) {
      return NextResponse.json({ error: "Imagen demasiado grande (>2MB)" }, { status: 413 })
    }
    if (!/^(https?:|data:image\/|blob:)/i.test(url)) {
      return NextResponse.json({ error: "URL debe empezar con http(s):// o ser una imagen local" }, { status: 400 })
    }

    const maxOrderRows = await query<any[]>(
      `SELECT COALESCE(MAX("order"), -1) AS m FROM "InstitutionCarouselImage" WHERE "institutionId" = ?`,
      [institutionId]
    )
    const nextOrder = ((maxOrderRows as any[])[0]?.m ?? -1) + 1

    const id = await create("InstitutionCarouselImage", {
      institutionId,
      url,
      alt,
      order: nextOrder,
    })

    const img = await query(`SELECT * FROM "InstitutionCarouselImage" WHERE id = ?`, [id])
    return NextResponse.json((img as any[])[0], { status: 201 })
  } catch (e: any) {
    console.error("[carousel POST]", e?.message ?? e)
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const institutionId = session.user.institutionId!
    const url = new URL(request.url)
    const id = Number(url.searchParams.get("id"))
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })

    const check = await query<any[]>(
      `SELECT id FROM "InstitutionCarouselImage" WHERE id = ? AND "institutionId" = ?`,
      [id, institutionId]
    )
    if (check.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    await remove("InstitutionCarouselImage", { id })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[carousel DELETE]", e?.message ?? e)
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}