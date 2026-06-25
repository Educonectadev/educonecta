import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const students = await query(
    `SELECT s.*,
      CASE WHEN s.gradeId IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name) ELSE NULL END AS grade,
      CASE WHEN s.sectionId IS NOT NULL THEN jsonb_build_object('id', sec.id, 'name', sec.name) ELSE NULL END AS section
    FROM Student s
    LEFT JOIN Grade g ON s.gradeId = g.id
    LEFT JOIN Section sec ON s.sectionId = sec.id
    WHERE s.institutionId = ?
    ORDER BY s.createdAt DESC`,
    [institutionId]
  )

  return NextResponse.json(students)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!

  try {
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("JSON parse error:", e)
      return NextResponse.json({ error: "Error al parsear body" }, { status: 400 })
    }
    const { firstName, lastName, documentId, email, phone, gradeId, sectionId } = body

    if (!firstName || !lastName || !documentId) {
      return NextResponse.json({ error: "Nombre, apellido y documento son requeridos" }, { status: 400 })
    }

    console.log(">>> Checking existing student:", { documentId, institutionId })
    try {
      var existing = await query("SELECT id FROM Student WHERE documentId = ? AND institutionId = ?", [documentId, institutionId])
    } catch (e) {
      console.error(">>> EXEC_SQL error on first query:", e)
      throw e
    }
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ya existe un alumno con ese documento en esta institución" }, { status: 409 })
    }

    console.log(">>> Creating student...")
    try {
      var insertId = await create("Student", {
        firstName,
        lastName,
        documentId,
        email: email || null,
        phone: phone || null,
        gradeId: gradeId || null,
        sectionId: sectionId || null,
        institutionId,
      })
    } catch (e) {
      console.error(">>> Supabase SDK create error:", e)
      throw e
    }
    console.log(">>> Created student with id:", insertId)

    console.log(">>> Fetching created student...")
    try {
      var student = await query(
        `SELECT s.*,
          CASE WHEN s.gradeId IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name) ELSE NULL END AS grade,
          CASE WHEN s.sectionId IS NOT NULL THEN jsonb_build_object('id', sec.id, 'name', sec.name) ELSE NULL END AS section
        FROM Student s
        LEFT JOIN Grade g ON s.gradeId = g.id
        LEFT JOIN Section sec ON s.sectionId = sec.id
        WHERE s.id = ?`,
        [insertId]
      )
    } catch (e) {
      console.error(">>> Exec_sql error on second query:", e)
      throw e
    }

    return NextResponse.json(student[0], { status: 201 })
  } catch (e) {
    console.error("Error creating student:", e)
    if (e instanceof Error) {
      console.error("Error name:", e.name, "message:", e.message, "stack:", e.stack)
    }
    return NextResponse.json({ error: "Error al crear alumno: " + (e instanceof Error ? e.message : String(e)) }, { status: 500 })
  }
}
