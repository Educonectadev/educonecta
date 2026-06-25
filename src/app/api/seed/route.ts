import { NextResponse } from "next/server"
import { query, execute, findOne, create } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"

async function ensureAuthUser(email: string, password: string) {
  const supabase = getSupabaseAdmin()
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find((u) => u.email === email)
  if (found) {
    await supabase.auth.admin.updateUserById(found.id, { password })
  } else {
    await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  }
}

export async function POST() {
  try {
    const bcrypt = await import("bcryptjs")

    const hash = await bcrypt.hash("admin123", 10)

    // Sync all seed accounts into Supabase Auth so they can log in
    await ensureAuthUser("super@educonecta.com", "admin123")
    await ensureAuthUser("admin@colegio.com", "admin123")
    await ensureAuthUser("profesor@colegio.com", "admin123")
    await ensureAuthUser("padre@ejemplo.com", "admin123")

    await execute(
      `INSERT IGNORE INTO User (email, passwordHash, name, role) VALUES (?, ?, ?, 'SUPER_ADMIN')`,
      ["super@educonecta.com", hash, "Super Administrador"]
    )

    await execute(
      `INSERT IGNORE INTO Institution (name, code, address, phone, email) VALUES (?, ?, ?, ?, ?)`,
      ["Colegio Ejemplo", "COL001", "Av. Principal 123", "555-0100", "info@colegioejemplo.com"]
    )
    const inst = await findOne("Institution", { code: "COL001" }) as any

    const adminEmail = "admin@colegio.com"
    let adminUser = await findOne("User", { email: adminEmail }) as any
    if (!adminUser) {
      const adminId = await create("User", {
        email: adminEmail,
        passwordHash: hash,
        name: "Director Ejemplo",
        role: "INSTITUTIONAL_ADMIN",
        institutionId: inst.id,
      })
      adminUser = await findOne("User", { id: adminId })
    }

    const existingAdmin = await findOne("InstitutionalAdmin", { userId: adminUser.id } as any)
    if (!existingAdmin) {
      await create("InstitutionalAdmin", { userId: adminUser.id, institutionId: inst.id } as any)
    }

    const teacherEmail = "profesor@colegio.com"
    let teacherUser = await findOne("User", { email: teacherEmail }) as any
    if (!teacherUser) {
      const teacherUserId = await create("User", {
        email: teacherEmail,
        passwordHash: hash,
        name: "Profesor Ejemplo",
        role: "TEACHER",
        institutionId: inst.id,
      })
      teacherUser = await findOne("User", { id: teacherUserId })
    }

    const existingTeacher = await findOne("Teacher", { userId: teacherUser.id } as any)
    if (!existingTeacher) {
      await create("Teacher", { userId: teacherUser.id, institutionId: inst.id, speciality: "Matemáticas" } as any)
    }

    const parentEmail = "padre@ejemplo.com"
    let parentUser = await findOne("User", { email: parentEmail }) as any
    if (!parentUser) {
      const parentUserId = await create("User", {
        email: parentEmail,
        passwordHash: hash,
        name: "Padre Ejemplo",
        role: "PARENT",
        institutionId: inst.id,
      })
      parentUser = await findOne("User", { id: parentUserId })
    }

    const existingParent = await findOne("Parent", { userId: parentUser.id } as any)
    let parent: any = existingParent
    if (!existingParent) {
      const parentId = await create("Parent", { userId: parentUser.id, institutionId: inst.id } as any)
      parent = await findOne("Parent", { id: parentId })
    }

    const primaryGrades = ["1ero", "2do", "3ero", "4to", "5to", "6to"]
    const secondaryGrades = ["1ero", "2do", "3ero", "4to", "5to"]
    const sectionNames = ["A", "B", "C", "D", "E", "F", "G", "H"]

    const grades: any[] = []

    for (const gName of primaryGrades) {
      let grade = await findOne("Grade", { name: gName, level: "Primaria", institutionId: inst.id } as any)
      if (!grade) {
        const gId = await create("Grade", { name: gName, level: "Primaria", institutionId: inst.id } as any)
        grade = (await findOne("Grade", { id: gId }))!
      }
      const gId = grade!.id
      grades.push(grade)

      for (const sName of sectionNames) {
        const existingSection = await findOne("Section", { name: sName, gradeId: gId } as any)
        if (!existingSection) {
          await create("Section", { name: sName, gradeId: gId, capacity: 30 } as any)
        }
      }
    }

    for (const gName of secondaryGrades) {
      let grade = await findOne("Grade", { name: gName, level: "Secundaria", institutionId: inst.id } as any)
      if (!grade) {
        const gId = await create("Grade", { name: gName, level: "Secundaria", institutionId: inst.id } as any)
        grade = (await findOne("Grade", { id: gId }))!
      }
      const gId = grade!.id
      grades.push(grade)

      for (const sName of sectionNames) {
        const existingSection = await findOne("Section", { name: sName, gradeId: gId } as any)
        if (!existingSection) {
          await create("Section", { name: sName, gradeId: gId, capacity: 30 } as any)
        }
      }
    }

    const grade = grades[0]
    const sections = await query<any[]>("SELECT * FROM Section WHERE name = ? AND gradeId = ? LIMIT 1", ["A", grade.id])
    const section = sections[0]

    let student = await findOne("Student", { id: 1 } as any)
    if (!student) {
      const studentId = await create("Student", {
        firstName: "Alumno",
        lastName: "Ejemplo",
        documentId: "DOC001",
        institutionId: inst.id,
        gradeId: grade.id,
        sectionId: section.id,
      } as any)
      student = (await findOne("Student", { id: studentId }))!
    }

    const existingLink = await findOne("ParentStudent", { parentId: parent.id, studentId: student!.id } as any)
    if (!existingLink) {
      await create("ParentStudent", { parentId: parent.id, studentId: student!.id, relationship: "Padre" } as any)
    }

    let course = await findOne("Course", { name: "Matemáticas", institutionId: inst.id } as any)
    if (!course) {
      const courseId = await create("Course", { name: "Matemáticas", code: "MAT101", institutionId: inst.id } as any)
      course = (await findOne("Course", { id: courseId }))!
    }

    const teachers = await query<any[]>("SELECT * FROM Teacher WHERE userId = ? LIMIT 1", [teacherUser.id])
    const teacher = teachers[0]

    const existingCT = await findOne("CourseTeacher", { courseId: course!.id, teacherId: teacher.id, gradeId: grade.id, sectionId: section.id } as any)
    if (!existingCT) {
      await create("CourseTeacher", { courseId: course!.id, teacherId: teacher.id, gradeId: grade.id, sectionId: section.id } as any)
    }

    return NextResponse.json({
      success: true,
      message: "Seed completado exitosamente",
      users: {
        superAdmin: "super@educonecta.com",
        admin: "admin@colegio.com",
        teacher: "profesor@colegio.com",
        parent: "padre@ejemplo.com",
      },
      password: "admin123",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al ejecutar seed", error: String(error) },
      { status: 500 },
    )
  }
}
