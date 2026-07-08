import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSession } from "@/lib/auth"
import { query, create } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let s = ""
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const students = await query(
    `SELECT s.id,
            s."firstName",
            s."lastName",
            s."documentId",
            s.email,
            s.phone,
            CASE WHEN s."gradeId" IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name, 'shift', g.shift) ELSE NULL END AS grade,
            CASE WHEN s."sectionId" IS NOT NULL THEN jsonb_build_object('id', sec.id, 'name', sec.name) ELSE NULL END AS section,
            (s."userId" IS NOT NULL) AS "hasAccount"
     FROM Student s
     LEFT JOIN Grade g ON s."gradeId" = g.id
     LEFT JOIN Section sec ON s."sectionId" = sec.id
     WHERE s."institutionId" = ?
     ORDER BY s."createdAt" DESC`,
    [institutionId]
  )

  return NextResponse.json(students)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { firstName, lastName, documentId, email, phone, gradeId, sectionId, createAccount } = body

    if (!firstName || !lastName || !documentId) {
      return NextResponse.json({ error: "Nombre, apellido y documento son requeridos" }, { status: 400 })
    }

    const existing = await query(
      `SELECT id FROM Student WHERE "documentId" = ? AND "institutionId" = ?`,
      [documentId, institutionId]
    )
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ya existe un alumno con ese documento en esta institución" }, { status: 409 })
    }

    let userId: number | null = null
    let tempPassword: string | null = null

    const wantsAccount = !!createAccount
    const emailClean = (email ?? "").trim().toLowerCase()
    if (!emailClean && wantsAccount) {
      return NextResponse.json(
        { error: "Para crear cuenta el alumno necesita un email personal." },
        { status: 400 }
      )
    }

    if (emailClean) {
      const dup = await query(`SELECT id FROM "User" WHERE email = ?`, [emailClean])
      if (dup.length > 0) {
        return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 })
      }
    }

    if (wantsAccount && emailClean) {
      tempPassword = generateTempPassword()
      const hash = await bcrypt.hash(tempPassword, 10)

      try {
        const supabase = getSupabaseAdmin()
        await supabase.auth.admin.createUser({
          email: emailClean,
          password: tempPassword,
          email_confirm: true,
        })
      } catch (e) {
        console.warn("[students] supabase auth createUser failed:", e)
      }

      userId = await create("User", {
        name: `${firstName} ${lastName}`.trim(),
        email: emailClean,
        passwordHash: hash,
        phone: phone || null,
        role: "STUDENT",
        institutionId,
      })
    }

    const studentId = await create("Student", {
      firstName,
      lastName,
      documentId,
      email: emailClean || null,
      phone: phone || null,
      gradeId: gradeId || null,
      sectionId: sectionId || null,
      institutionId,
      userId,
    })

    const student = await query(
      `SELECT s.*,
        CASE WHEN s."gradeId" IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name, 'shift', g.shift) ELSE NULL END AS grade,
        CASE WHEN s."sectionId" IS NOT NULL THEN jsonb_build_object('id', sec.id, 'name', sec.name) ELSE NULL END AS section
      FROM Student s
      LEFT JOIN Grade g ON s."gradeId" = g.id
      LEFT JOIN Section sec ON s."sectionId" = sec.id
      WHERE s.id = ?`,
      [studentId]
    )

    return NextResponse.json(
      { ...student[0], tempPassword },
      { status: 201 }
    )
  } catch (e) {
    console.error("Error creating student:", e)
    return NextResponse.json({ error: "Error al crear alumno" }, { status: 500 })
  }
}
