import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TABLE = (name: string) => `"${name}"`

async function createAuthUser(email: string, password: string) {
  // Try to create the user directly; if they already exist, skip
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    if (error.message.includes("already exists") || error.message.includes("already registered")) {
      console.log(`  Auth user already exists: ${email}`)
    } else {
      console.error(`  Error creating auth user ${email}:`, error.message)
    }
  } else {
    console.log(`  Auth user created: ${email}`)
  }
}

async function seed() {
  const hash = await bcrypt.hash("admin123", 10)

  // ── Institution ──
  const { data: existingInst, error: existingInstErr } = await supabase
    .from("Institution").select("id").eq("code", "COL001").maybeSingle()
  if (existingInstErr) {
    console.error("Error checking Institution:", existingInstErr.message)
    process.exit(1)
  }
  let instId = existingInst?.id
  if (!instId) {
    const { data, error } = await supabase.from("Institution").insert({
      name: "Colegio Ejemplo", code: "COL001", type: "private",
      address: "Av. Principal 123", district: "Miraflores",
      province: "Lima", department: "Lima",
      phone: "555-0100", email: "info@colegioejemplo.com",
      website: "https://colegioejemplo.edu.pe", directorName: "Director Ejemplo",
    }).select("id").single()
    if (error || !data) {
      console.error("Error inserting Institution:", error?.message ?? "data is null")
      process.exit(1)
    }
    instId = data.id
  }

  // ── Super Admin User ──
  const { data: existingSuper } = await supabase
    .from("User").select("id").eq("email", "super@educonecta.com").maybeSingle()
  let superUserId = existingSuper?.id
  if (!superUserId) {
    const { data } = await supabase.from("User").insert({
      email: "super@educonecta.com", passwordHash: hash,
      name: "Super Administrador", role: "SUPER_ADMIN",
    }).select("id").single()
    superUserId = data!.id
  }
  await createAuthUser("super@educonecta.com", "admin123")

  // ── Admin User ──
  const { data: existingAdmin } = await supabase
    .from("User").select("id").eq("email", "admin@colegio.com").maybeSingle()
  let adminUserId = existingAdmin?.id
  if (!adminUserId) {
    const { data } = await supabase.from("User").insert({
      email: "admin@colegio.com", passwordHash: hash,
      name: "Director Ejemplo", role: "INSTITUTIONAL_ADMIN",
      institutionId: instId,
    }).select("id").single()
    adminUserId = data!.id
  }
  await createAuthUser("admin@colegio.com", "admin123")

  const { data: existingIA } = await supabase
    .from("InstitutionalAdmin").select("id").eq("userId", adminUserId).maybeSingle()
  if (!existingIA) {
    await supabase.from("InstitutionalAdmin").insert({
      userId: adminUserId, institutionId: instId,
    })
  }

  // ── Teacher User ──
  const { data: existingTeacherUser } = await supabase
    .from("User").select("id").eq("email", "profesor@colegio.com").maybeSingle()
  let teacherUserId = existingTeacherUser?.id
  if (!teacherUserId) {
    const { data } = await supabase.from("User").insert({
      email: "profesor@colegio.com", passwordHash: hash,
      name: "Profesor Ejemplo", role: "TEACHER", institutionId: instId,
    }).select("id").single()
    teacherUserId = data!.id
  }
  await createAuthUser("profesor@colegio.com", "admin123")

  let teacherId: number
  const { data: existingT } = await supabase
    .from("Teacher").select("id").eq("userId", teacherUserId).maybeSingle()
  if (existingT) {
    teacherId = existingT.id
  } else {
    const { data } = await supabase.from("Teacher").insert({
      userId: teacherUserId, institutionId: instId, speciality: "Matemáticas",
    }).select("id").single()
    teacherId = data!.id
  }

  // ── Parent User ──
  const { data: existingParentUser } = await supabase
    .from("User").select("id").eq("email", "padre@ejemplo.com").maybeSingle()
  let parentUserId = existingParentUser?.id
  if (!parentUserId) {
    const { data } = await supabase.from("User").insert({
      email: "padre@ejemplo.com", passwordHash: hash,
      name: "Padre Ejemplo", role: "PARENT", institutionId: instId,
    }).select("id").single()
    parentUserId = data!.id
  }
  await createAuthUser("padre@ejemplo.com", "admin123")

  let parentId: number
  const { data: existingP } = await supabase
    .from("Parent").select("id").eq("userId", parentUserId).maybeSingle()
  if (existingP) {
    parentId = existingP.id
  } else {
    const { data } = await supabase.from("Parent").insert({
      userId: parentUserId, institutionId: instId,
    }).select("id").single()
    parentId = data!.id
  }

  // ── Grades & Sections ──
  const primaryGrades = ["1ero", "2do", "3ero", "4to", "5to", "6to"]
  const secondaryGrades = ["1ero", "2do", "3ero", "4to", "5to"]
  const sectionNames = ["A", "B", "C", "D", "E", "F", "G", "H"]
  const gradeIds: number[] = []

  for (const gName of primaryGrades) {
    const { data: existing } = await supabase
      .from("Grade").select("id").eq("name", gName).eq("level", "Primaria").eq("institutionId", instId).maybeSingle()
    let gid: number
    if (existing) {
      gid = existing.id
    } else {
      const { data } = await supabase.from("Grade").insert({
        name: gName, level: "Primaria", institutionId: instId,
      }).select("id").single()
      gid = data!.id
    }
    gradeIds.push(gid)
    for (const sName of sectionNames) {
      const { data: existingS } = await supabase
        .from("Section").select("id").eq("name", sName).eq("gradeId", gid).maybeSingle()
      if (!existingS) {
        await supabase.from("Section").insert({ name: sName, gradeId: gid, capacity: 30 })
      }
    }
  }

  for (const gName of secondaryGrades) {
    const { data: existing } = await supabase
      .from("Grade").select("id").eq("name", gName).eq("level", "Secundaria").eq("institutionId", instId).maybeSingle()
    let gid: number
    if (existing) {
      gid = existing.id
    } else {
      const { data } = await supabase.from("Grade").insert({
        name: gName, level: "Secundaria", institutionId: instId,
      }).select("id").single()
      gid = data!.id
    }
    gradeIds.push(gid)
    for (const sName of sectionNames) {
      const { data: existingS } = await supabase
        .from("Section").select("id").eq("name", sName).eq("gradeId", gid).maybeSingle()
      if (!existingS) {
        await supabase.from("Section").insert({ name: sName, gradeId: gid, capacity: 30 })
      }
    }
  }

  const firstGradeId = gradeIds[0]
  const { data: section } = await supabase
    .from("Section").select("id").eq("name", "A").eq("gradeId", firstGradeId).limit(1).single()
  const sectionId = section?.id

  // ── Student ──
  const { data: existingStudent } = await supabase
    .from("Student").select("id").eq("documentId", "DOC001").maybeSingle()
  let studentId = existingStudent?.id
  if (!studentId) {
    const { data } = await supabase.from("Student").insert({
      firstName: "Alumno", lastName: "Ejemplo", documentId: "DOC001",
      institutionId: instId, gradeId: firstGradeId, sectionId,
    }).select("id").single()
    studentId = data!.id
  }

  // ── ParentStudent ──
  const { data: existingPS } = await supabase
    .from("ParentStudent").select("parentId")
    .eq("parentId", parentId).eq("studentId", studentId).maybeSingle()
  if (!existingPS) {
    await supabase.from("ParentStudent").insert({
      parentId, studentId, relationship: "Padre",
    })
  }

  // ── Course ──
  const { data: existingCourse } = await supabase
    .from("Course").select("id").eq("name", "Matemáticas").eq("institutionId", instId).maybeSingle()
  let courseId = existingCourse?.id
  if (!courseId) {
    const { data } = await supabase.from("Course").insert({
      name: "Matemáticas", code: "MAT101", institutionId: instId,
    }).select("id").single()
    courseId = data!.id
  }

  // ── CourseTeacher ──
  const { data: existingCT } = await supabase
    .from("CourseTeacher").select("id")
    .eq("courseId", courseId).eq("teacherId", teacherId)
    .eq("gradeId", firstGradeId).eq("sectionId", sectionId).maybeSingle()
  if (!existingCT) {
    await supabase.from("CourseTeacher").insert({
      courseId, teacherId, gradeId: firstGradeId, sectionId,
    })
  }

  console.log("Seed completado exitosamente")
  console.log("Usuarios creados (contraseña: admin123):")
  console.log("  super@educonecta.com (Super Administrador)")
  console.log("  admin@colegio.com (Admin Institucional)")
  console.log("  profesor@colegio.com (Profesor)")
  console.log("  padre@ejemplo.com (Padre)")
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
