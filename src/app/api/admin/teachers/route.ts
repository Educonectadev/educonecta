import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { authOptions } from "@/lib/auth"
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
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const teachers = await query(
    `SELECT t.*,
      JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
    FROM Teacher t
    JOIN User u ON t.userId = u.id
    WHERE t.institutionId = ?
    ORDER BY t.createdAt DESC`,
    [institutionId]
  )

  return NextResponse.json(teachers)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { firstName, lastName, password, phone, speciality, documentId, professionalTitle, educationLevel, hireDate, contractType, address, emergencyContactName, emergencyContactPhone } = body

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
      role: "TEACHER",
      institutionId,
    })

    const teacherId = await create("Teacher", {
      institutionId,
      userId,
      speciality: speciality || null,
      documentId: documentId || null,
      professionalTitle: professionalTitle || null,
      educationLevel: educationLevel || null,
      hireDate: hireDate || null,
      contractType: contractType || null,
      address: address || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
    })

    const teacher = await query(
      `SELECT t.*,
        JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
      FROM Teacher t
      JOIN User u ON t.userId = u.id
      WHERE t.id = ?`,
      [teacherId]
    )

    return NextResponse.json(teacher[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear profesor" }, { status: 500 })
  }
}
