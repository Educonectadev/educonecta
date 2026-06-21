import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findMany, findOne, create } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const gradeId = searchParams.get("gradeId")

  if (!gradeId) {
    return NextResponse.json({ error: "gradeId es requerido" }, { status: 400 })
  }

  const sections = await findMany("Section", {
    where: { gradeId: Number(gradeId) },
    orderBy: "name",
    orderDir: "ASC",
  })

  return NextResponse.json(sections)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const { name, gradeId, capacity } = body

  if (!name || !gradeId) {
    return NextResponse.json({ error: "Nombre y grado requeridos" }, { status: 400 })
  }

  const dup = await findOne("Section", { name, gradeId: Number(gradeId) })
  if (dup) return NextResponse.json({ error: "Ya existe una sección con ese nombre en este grado" }, { status: 409 })

  const insertId = await create("Section", { name, gradeId: Number(gradeId), capacity: capacity ? Number(capacity) : null })
  const section = await findOne("Section", { id: insertId })
  return NextResponse.json(section)
}
