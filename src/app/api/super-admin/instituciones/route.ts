import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { findOne, create, update, remove, query } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

const GRADE_STRUCTURE: Record<string, string[]> = {
  inicial: ["3 años", "4 años", "5 años"],
  primaria: ["1ero", "2do", "3ero", "4to", "5to", "6to"],
  secundaria: ["1ero", "2do", "3ero", "4to", "5to"],
}

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 })
  }

  try {
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      const body = await req.json()
      const { name, code, type, ruc, address, district, province, department, phone, email, website, directorName, educationalLevel, shifts, foundedYear, description, directorEmail, directorPassword, sectionsPerGrade } = body

      if (!name?.trim() || !code?.trim()) {
        return NextResponse.json(
          { message: "Nombre y código son requeridos" },
          { status: 400 },
        )
      }

      const existing = await findOne("Institution", { code })
      if (existing) {
        return NextResponse.json(
          { message: "Ya existe una institución con ese código" },
          { status: 409 },
        )
      }

      if (directorEmail && directorPassword) {
        const existingUser = await findOne("User", { email: directorEmail.trim() })
        if (existingUser) {
          return NextResponse.json(
            { message: "El email del director ya está registrado en el sistema" },
            { status: 409 },
          )
        }
      }

      const insertId = await create("Institution", {
        name: name.trim(),
        code: code.trim(),
        type: type ?? "public",
        ruc: ruc || null,
        address: address || null,
        district: district || null,
        province: province || null,
        department: department || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        directorName: directorName || null,
        educationalLevel: educationalLevel || null,
        shifts: shifts || null,
        foundedYear: foundedYear ? Number(foundedYear) : null,
        description: description || null,
      })
      const institution = await findOne("Institution", { id: insertId })

      let user = null
      if (directorEmail && directorPassword) {
        const supabase = getSupabaseAdmin()
        const { data: existingAuth } = await supabase.auth.admin.listUsers()
        const found = existingAuth?.users?.find((u) => u.email === directorEmail.trim())
        if (!found) {
          const { error: authError } = await supabase.auth.admin.createUser({
            email: directorEmail.trim(),
            password: directorPassword,
            email_confirm: true,
          })
          if (authError) {
            return NextResponse.json({ message: `Error al crear usuario de acceso: ${authError.message}` }, { status: 500 })
          }
        } else {
          const { error: updateError } = await supabase.auth.admin.updateUserById(found.id, { password: directorPassword })
          if (updateError) {
            return NextResponse.json({ message: `Error al actualizar contraseña: ${updateError.message}` }, { status: 500 })
          }
        }
        const passwordHash = await bcrypt.hash(directorPassword, 10)
        const userId = await create("User", {
          email: directorEmail.trim(),
          passwordHash,
          name: (directorName || name).trim(),
          role: "INSTITUTIONAL_ADMIN",
          institutionId: insertId,
        } as any)
        await create("InstitutionalAdmin", { userId, institutionId: insertId } as any)
        user = { email: directorEmail.trim(), password: directorPassword, name: (directorName || name).trim() }
      }

      let grades: Record<string, string[]> = {}
      if (educationalLevel) {
        const numSections = Math.min(Math.max(Number(sectionsPerGrade) || 8, 1), 26)
        const levels = educationalLevel.split(",").filter(Boolean)
        for (const level of levels) {
          const gradeNames = GRADE_STRUCTURE[level]
          if (!gradeNames) continue
          const createdGrades: string[] = []
          for (const gradeName of gradeNames) {
            const gradeId = await create("Grade", { name: gradeName, level, institutionId: insertId } as any)
            for (let i = 0; i < numSections; i++) {
              const sectionName = String.fromCharCode(65 + i)
              await create("Section", { name: sectionName, gradeId, capacity: 30 } as any)
            }
            createdGrades.push(gradeName)
          }
          grades[level] = createdGrades
        }
      }

      const sectionCount = Math.min(Math.max(Number(sectionsPerGrade) || 8, 1), 26)

      return NextResponse.json({ success: true, institution, user, grades, sectionCount }, { status: 201 })
    }

    const formData = await req.formData()
    const method = formData.get("_method")

    if (method === "PATCH") {
      const id = Number(req.nextUrl.searchParams.get("id"))
      if (!id) {
        return NextResponse.json(
          { message: "ID de institución requerido" },
          { status: 400 },
        )
      }

      const institution = await findOne("Institution", { id })
      if (!institution) {
        return NextResponse.json(
          { message: "Institución no encontrada" },
          { status: 404 },
        )
      }

      await update("Institution", { id }, { isActive: !(institution as any).isActive })

      return NextResponse.redirect(
        new URL("/dashboard/super-admin/instituciones", req.url),
      )
    }

    return NextResponse.json(
      { message: "Método no permitido" },
      { status: 405 },
    )
  } catch {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 })
  }

  try {
    const id = Number(req.nextUrl.searchParams.get("id"))
    if (!id) {
      return NextResponse.json({ message: "ID de institución requerido" }, { status: 400 })
    }

    const institution = await findOne("Institution", { id })
    if (!institution) {
      return NextResponse.json({ message: "Institución no encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const { name, code, type, ruc, address, district, province, department, phone, email, website, directorName, educationalLevel, shifts, foundedYear, description } = body

    if (!name?.trim() || !code?.trim()) {
      return NextResponse.json({ message: "Nombre y código son requeridos" }, { status: 400 })
    }

    const duplicate = await findOne("Institution", { code })
    if (duplicate && (duplicate as any).id !== id) {
      return NextResponse.json({ message: "Ya existe otra institución con ese código" }, { status: 409 })
    }

    await update("Institution", { id }, {
      name: name.trim(),
      code: code.trim(),
      type: type ?? "public",
      ruc: ruc || null,
      address: address || null,
      district: district || null,
      province: province || null,
      department: department || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      directorName: directorName || null,
      educationalLevel: educationalLevel || null,
      shifts: shifts || null,
      foundedYear: foundedYear ? Number(foundedYear) : null,
      description: description || null,
    })

    const updated = await findOne("Institution", { id })
    return NextResponse.json({ success: true, institution: updated })
  } catch {
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 })
  }

  try {
    const id = Number(req.nextUrl.searchParams.get("id"))
    if (!id) {
      return NextResponse.json(
        { message: "ID de institución requerido" },
        { status: 400 },
      )
    }

    const institution = await findOne("Institution", { id })
    if (!institution) {
      return NextResponse.json(
        { message: "Institución no encontrada" },
        { status: 404 },
      )
    }

    await update("Institution", { id }, { isActive: !(institution as any).isActive })

    return NextResponse.json({ success: true, institution: { ...(institution as any), isActive: !(institution as any).isActive } })
  } catch {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 })
  }

  try {
    const id = Number(req.nextUrl.searchParams.get("id"))
    if (!id) {
      return NextResponse.json({ message: "ID de institución requerido" }, { status: 400 })
    }

    const institution = await findOne("Institution", { id })
    if (!institution) {
      return NextResponse.json({ message: "Institución no encontrada" }, { status: 404 })
    }

    await query("DELETE FROM User WHERE institutionId = ?", [id])
    await remove("Institution", { id })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 },
    )
  }
}
