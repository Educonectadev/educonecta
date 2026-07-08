import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const grades = await query(
    `SELECT g.*,
      COALESCE(
        JSON_ARRAYAGG(
          jsonb_build_object('id', s.id, 'name', s.name, 'gradeId', s.gradeId, 'capacity', s.capacity)
          ORDER BY s.name ASC
        ),
        JSON_ARRAY()
      ) AS sections
    FROM Grade g
    LEFT JOIN Section s ON s.gradeId = g.id
    WHERE g.institutionId = ?
    GROUP BY g.id
    ORDER BY g.name ASC`,
    [institutionId]
  )

  return NextResponse.json(grades)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const body = await request.json()
  const { name, level, defaultShift } = body

  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })

  const dup = await query("SELECT id FROM Grade WHERE name = ? AND institutionId = ?", [name, institutionId])
  if (dup.length > 0) return NextResponse.json({ error: "Ya existe un grado con ese nombre" }, { status: 409 })

  const insertId = await create("Grade", { name, level: level ?? null, defaultShift: defaultShift || null, institutionId })

  const grade = await query(
    `SELECT g.*,
      COALESCE(
        JSON_ARRAYAGG(
          jsonb_build_object('id', s.id, 'name', s.name, 'gradeId', s.gradeId, 'capacity', s.capacity)
          ORDER BY s.name ASC
        ),
        JSON_ARRAY()
      ) AS sections
    FROM Grade g
    LEFT JOIN Section s ON s.gradeId = g.id
    WHERE g.id = ?
    GROUP BY g.id`,
    [insertId]
  )
  return NextResponse.json(grade[0])
}
