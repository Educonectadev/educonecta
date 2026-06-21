import "dotenv/config"
import bcrypt from "bcryptjs"
import { query, execute, endPool } from "@/lib/prisma"

async function seed() {
  const hash = await bcrypt.hash("admin123", 10)

  const existingSuper = await query<any[]>("SELECT id FROM User WHERE email = ?", ["super@educonecta.com"])
  const superAdminId = existingSuper.length
    ? existingSuper[0].id
    : await execute(
        "INSERT INTO User (email, passwordHash, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
        ["super@educonecta.com", hash, "Super Administrador", "SUPER_ADMIN"],
      ).then((r) => r.insertId)

  const existingInst = await query<any[]>("SELECT id FROM Institution WHERE code = ?", ["COL001"])
  const instId = existingInst.length
    ? existingInst[0].id
    : await execute(
         "INSERT INTO Institution (name, code, type, address, district, province, department, phone, email, website, directorName, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
        ["Colegio Ejemplo", "COL001", "private", "Av. Principal 123", "Miraflores", "Lima", "Lima", "555-0100", "info@colegioejemplo.com", "https://colegioejemplo.edu.pe", "Director Ejemplo"],
      ).then((r) => r.insertId)

  const existingAdmin = await query<any[]>("SELECT id FROM User WHERE email = ?", ["admin@colegio.com"])
  const adminUserId = existingAdmin.length
    ? existingAdmin[0].id
    : await execute(
        "INSERT INTO User (email, passwordHash, name, role, institutionId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        ["admin@colegio.com", hash, "Director Ejemplo", "INSTITUTIONAL_ADMIN", instId],
      ).then((r) => r.insertId)

  const existingIA = await query<any[]>("SELECT id FROM InstitutionalAdmin WHERE userId = ?", [adminUserId])
  if (!existingIA.length) {
    await execute("INSERT INTO InstitutionalAdmin (userId, institutionId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())", [adminUserId, instId])
  }

  const existingTeacherUser = await query<any[]>("SELECT id FROM User WHERE email = ?", ["profesor@colegio.com"])
  const teacherUserId = existingTeacherUser.length
    ? existingTeacherUser[0].id
    : await execute(
        "INSERT INTO User (email, passwordHash, name, role, institutionId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        ["profesor@colegio.com", hash, "Profesor Ejemplo", "TEACHER", instId],
      ).then((r) => r.insertId)

  let teacherId: number
  const existingT = await query<any[]>("SELECT id FROM Teacher WHERE userId = ?", [teacherUserId])
  if (existingT.length) {
    teacherId = existingT[0].id
  } else {
    teacherId = await execute(
      "INSERT INTO Teacher (userId, institutionId, speciality, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
      [teacherUserId, instId, "Matemáticas"],
    ).then((r) => r.insertId)
  }

  const existingParentUser = await query<any[]>("SELECT id FROM User WHERE email = ?", ["padre@ejemplo.com"])
  const parentUserId = existingParentUser.length
    ? existingParentUser[0].id
    : await execute(
        "INSERT INTO User (email, passwordHash, name, role, institutionId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        ["padre@ejemplo.com", hash, "Padre Ejemplo", "PARENT", instId],
      ).then((r) => r.insertId)

  let parentId: number
  const existingP = await query<any[]>("SELECT id FROM Parent WHERE userId = ?", [parentUserId])
  if (existingP.length) {
    parentId = existingP[0].id
  } else {
    parentId = await execute(
      "INSERT INTO Parent (userId, institutionId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())",
      [parentUserId, instId],
    ).then((r) => r.insertId)
  }

  const primaryGrades = ["1ero", "2do", "3ero", "4to", "5to", "6to"]
  const secondaryGrades = ["1ero", "2do", "3ero", "4to", "5to"]
  const sectionNames = ["A", "B", "C", "D", "E", "F", "G", "H"]

  const gradeIds: number[] = []

  for (const gName of primaryGrades) {
    const existing = await query<any[]>(
      "SELECT id FROM Grade WHERE name = ? AND level = ? AND institutionId = ?",
      [gName, "Primaria", instId],
    )
    if (existing.length) {
      gradeIds.push(existing[0].id)
    } else {
      const id = await execute(
        "INSERT INTO Grade (name, level, institutionId, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
        [gName, "Primaria", instId],
      ).then((r) => r.insertId)
      gradeIds.push(id)
    }

    const gid = gradeIds[gradeIds.length - 1]
    for (const sName of sectionNames) {
      const existingS = await query<any[]>(
        "SELECT id FROM Section WHERE name = ? AND gradeId = ?",
        [sName, gid],
      )
      if (!existingS.length) {
        await execute("INSERT INTO Section (name, gradeId, capacity, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())", [sName, gid, 30])
      }
    }
  }

  for (const gName of secondaryGrades) {
    const existing = await query<any[]>(
      "SELECT id FROM Grade WHERE name = ? AND level = ? AND institutionId = ?",
      [gName, "Secundaria", instId],
    )
    if (existing.length) {
      gradeIds.push(existing[0].id)
    } else {
      const id = await execute(
        "INSERT INTO Grade (name, level, institutionId, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
        [gName, "Secundaria", instId],
      ).then((r) => r.insertId)
      gradeIds.push(id)
    }

    const gid = gradeIds[gradeIds.length - 1]
    for (const sName of sectionNames) {
      const existingS = await query<any[]>(
        "SELECT id FROM Section WHERE name = ? AND gradeId = ?",
        [sName, gid],
      )
      if (!existingS.length) {
        await execute("INSERT INTO Section (name, gradeId, capacity, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())", [sName, gid, 30])
      }
    }
  }

  const firstGradeId = gradeIds[0]
  const sections = await query<any[]>("SELECT id FROM Section WHERE name = ? AND gradeId = ? LIMIT 1", ["A", firstGradeId])
  const sectionId = sections[0]?.id

  const existingStudent = await query<any[]>("SELECT id FROM Student WHERE documentId = ?", ["DOC001"])
  const studentId = existingStudent.length
    ? existingStudent[0].id
    : await execute(
        "INSERT INTO Student (firstName, lastName, documentId, institutionId, gradeId, sectionId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        ["Alumno", "Ejemplo", "DOC001", instId, firstGradeId, sectionId],
      ).then((r) => r.insertId)

  const existingPS = await query<any[]>(
    "SELECT parentId FROM ParentStudent WHERE parentId = ? AND studentId = ?",
    [parentId, studentId],
  )
  if (!existingPS.length) {
    await execute("INSERT INTO ParentStudent (parentId, studentId, relationship) VALUES (?, ?, ?)", [
      parentId,
      studentId,
      "Padre",
    ])
  }

  const existingCourse = await query<any[]>(
    "SELECT id FROM Course WHERE name = ? AND institutionId = ?",
    ["Matemáticas", instId],
  )
  const courseId = existingCourse.length
    ? existingCourse[0].id
    : await execute(
        "INSERT INTO Course (name, code, institutionId, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
        ["Matemáticas", "MAT101", instId],
      ).then((r) => r.insertId)

  const existingCT = await query<any[]>(
    "SELECT id FROM CourseTeacher WHERE courseId = ? AND teacherId = ? AND gradeId = ? AND sectionId = ?",
    [courseId, teacherId, firstGradeId, sectionId],
  )
  if (!existingCT.length) {
    await execute(
      "INSERT INTO CourseTeacher (courseId, teacherId, gradeId, sectionId) VALUES (?, ?, ?, ?)",
      [courseId, teacherId, firstGradeId, sectionId],
    )
  }

  console.log("Seed completado exitosamente")
  console.log("Usuarios creados (contraseña: admin123):")
  console.log("  super@educonecta.com (Super Administrador)")
  console.log("  admin@colegio.com (Admin Institucional)")
  console.log("  profesor@colegio.com (Profesor)")
  console.log("  padre@ejemplo.com (Padre)")
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => endPool())
