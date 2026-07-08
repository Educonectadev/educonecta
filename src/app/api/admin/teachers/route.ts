import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { query, create } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
}

async function generateEmail(firstName: string, lastName: string, institutionId: number): Promise<string> {
  const base = `${normalize(firstName)}.${normalize(lastName)}`
  const inst = await query("SELECT name FROM Institution WHERE id = ?", [institutionId])
  const domain = normalize((inst as any[])[0]?.name || "colegio")
  let email = `${base}@${domain}.edu.pe`
  let counter = 1
  while (true) {
    const rows = await query("SELECT id FROM User WHERE email = ?", [email])
    if ((rows as any[]).length === 0) return email
    counter++
    email = `${base}${counter}@${domain}.edu.pe`
  }
}

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const teachers = await query(
    `SELECT t.*,
      jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
    FROM Teacher t
    JOIN User u ON t.userId = u.id
    WHERE t.institutionId = ?
    ORDER BY t.createdAt DESC`,
    [institutionId]
  )

  return NextResponse.json(teachers)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { firstName, lastName, password, phone, speciality, documentId, professionalTitle, educationLevel, hireDate, address, contractType, emergencyContactName, emergencyContactPhone, assignedLevels } = body

    if (!firstName || !lastName || !password) {
      return NextResponse.json({ error: "Nombres, apellidos y contraseña son requeridos" }, { status: 400 })
    }

    const name = `${firstName.trim()} ${lastName.trim()}`
    const email = await generateEmail(firstName.trim(), lastName.trim(), institutionId)

    const passwordHash = await bcrypt.hash(password, 10)

    // Create Supabase Auth user so the teacher can log in
    const supabase = getSupabaseAdmin()
    const { error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

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
      title: professionalTitle || null,
      educationLevel: educationLevel || null,
      hireDate: hireDate || null,
      address: address || null,
      contractType: contractType || null,
      emergencyContact: emergencyContactName || null,
      emergencyPhone: emergencyContactPhone || null,
      assignedLevels: Array.isArray(assignedLevels) && assignedLevels.length > 0 ? assignedLevels : null,
    })

    const assignments = Array.isArray(body.assignments) ? body.assignments : []
    const createdAssignments: { courseId: number; teacherId: number; gradeId: number | null; sectionId: number | null }[] = []
    for (const a of assignments) {
      if (!a?.courseId) continue
      const courseId = Number(a.courseId)
      const gradeId = a.gradeId ? Number(a.gradeId) : null
      const sectionId = a.sectionId ? Number(a.sectionId) : null
      const exists = await query(
        `SELECT id FROM "CourseTeacher"
         WHERE "courseId" = ?
           AND "teacherId" = ?
           AND "gradeId" IS NOT DISTINCT FROM ?
           AND "sectionId" IS NOT DISTINCT FROM ?`,
        [courseId, teacherId, gradeId, sectionId]
      )
      if ((exists as any[]).length > 0) continue
      await create("CourseTeacher", { courseId, teacherId, gradeId, sectionId })
      createdAssignments.push({ courseId, teacherId, gradeId, sectionId })
    }

    const teacher = await query(
      `SELECT t.*,
        jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
      FROM Teacher t
      JOIN User u ON t.userId = u.id
      WHERE t.id = ?`,
      [teacherId]
    )

    return NextResponse.json({ ...teacher[0], assignments: createdAssignments }, { status: 201 })
  } catch (e) {
    console.error("Error creating teacher:", e)
    return NextResponse.json({ error: "Error al crear profesor" }, { status: 500 })
  }
}
