import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { query, create } from "@/lib/prisma"

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
}

async function generateEmail(firstName: string, lastName: string): Promise<string> {
  const base = `${normalize(firstName)}.${normalize(lastName)}`
  let email = `${base}@colegio.edu.pe`
  let counter = 1
  while (true) {
    const rows = await query("SELECT id FROM User WHERE email = ?", [email])
    if ((rows as any[]).length === 0) return email
    counter++
    email = `${base}${counter}@colegio.edu.pe`
  }
}

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const parents = await query(
    `SELECT p.*,
      JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user,
      COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT('id', ps.id, 'parentId', ps.parentId, 'studentId', ps.studentId, 'student', JSON_OBJECT('id', st.id, 'firstName', st.firstName, 'lastName', st.lastName, 'documentId', st.documentId))
        ),
        JSON_ARRAY()
      ) AS children
    FROM Parent p
    JOIN User u ON p.userId = u.id
    LEFT JOIN ParentStudent ps ON ps.parentId = p.id
    LEFT JOIN Student st ON ps.studentId = st.id
    WHERE p.institutionId = ?
    GROUP BY p.id
    ORDER BY p.createdAt DESC`,
    [institutionId]
  )

  return NextResponse.json(parents)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { firstName, lastName, password, phone, studentIds } = body

    if (!firstName || !lastName || !password) {
      return NextResponse.json({ error: "Nombres, apellidos y contraseña son requeridos" }, { status: 400 })
    }

    const name = `${firstName.trim()} ${lastName.trim()}`
    const email = await generateEmail(firstName.trim(), lastName.trim())

    const passwordHash = await bcrypt.hash(password, 10)

    const userId = await create("User", {
      name,
      email,
      passwordHash,
      phone: phone || null,
      role: "PARENT",
      institutionId,
    })

    const parentId = await create("Parent", {
      institutionId,
      userId,
    })

    if (Array.isArray(studentIds)) {
      for (const studentId of studentIds) {
        await create("ParentStudent", { parentId, studentId })
      }
    }

    const parent = await query(
      `SELECT p.*,
        JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT('id', ps.id, 'parentId', ps.parentId, 'studentId', ps.studentId, 'student', JSON_OBJECT('id', st.id, 'firstName', st.firstName, 'lastName', st.lastName, 'documentId', st.documentId))
          ),
          JSON_ARRAY()
        ) AS children
      FROM Parent p
      JOIN User u ON p.userId = u.id
      LEFT JOIN ParentStudent ps ON ps.parentId = p.id
      LEFT JOIN Student st ON ps.studentId = st.id
      WHERE p.id = ?
      GROUP BY p.id`,
      [parentId]
    )

    return NextResponse.json(parent[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear padre" }, { status: 500 })
  }
}
