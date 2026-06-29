import * as XLSX from "xlsx"
import { getSupabaseAdmin } from "./supabase"

export type ImportResult = {
  success: number
  errors: { row: number; message: string }[]
  total: number
}

export async function parseExcel(buffer: Buffer): Promise<Record<string, unknown>[]> {
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet)
}

export async function importStudents(
  institutionId: number,
  rows: Record<string, unknown>[],
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, errors: [], total: rows.length }
  const admin = getSupabaseAdmin()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2

    try {
      const firstName = String(row.nombres || row.Nombres || row.firstName || "").trim()
      const lastName = String(row.apellidos || row.Apellidos || row.lastName || "").trim()
      const documentId = String(row.dni || row.DNI || row.documentId || row.Documento || "").trim()
      const gradeName = String(row.grado || row.Grado || row.grade || "").trim()
      const sectionName = String(row.seccion || row.Seccion || row.section || "").trim()

      if (!firstName || !lastName || !documentId) {
        result.errors.push({ row: rowNum, message: "Faltan campos requeridos (nombres, apellidos, dni)" })
        continue
      }

      let gradeId: number | null = null
      if (gradeName) {
        const { data: grade } = await admin
          .from("Grade")
          .select("id")
          .eq("institutionId", institutionId)
          .eq("name", gradeName)
          .maybeSingle()
        if (grade) gradeId = grade.id
      }

      let sectionId: number | null = null
      if (sectionName && gradeId) {
        const { data: section } = await admin
          .from("Section")
          .select("id")
          .eq("gradeId", gradeId)
          .eq("name", sectionName)
          .maybeSingle()
        if (section) sectionId = section.id
      }

      const { error } = await admin.from("Student").insert({
        firstName,
        lastName,
        documentId,
        institutionId,
        gradeId,
        sectionId,
        isActive: true,
      })

      if (error) {
        result.errors.push({ row: rowNum, message: error.message })
      } else {
        result.success++
      }
    } catch (err: any) {
      result.errors.push({ row: rowNum, message: err.message })
    }
  }

  return result
}

export async function importGrades(
  institutionId: number,
  teacherId: number,
  rows: Record<string, unknown>[],
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, errors: [], total: rows.length }
  const admin = getSupabaseAdmin()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2

    try {
      const documentId = String(row.dni || row.DNI || row.documentId || "").trim()
      const courseName = String(row.curso || row.Curso || row.course || "").trim()
      const evaluationName = String(row.evaluacion || row.Evaluacion || row.evaluation || "Evaluación").trim()
      const grade = Number(row.nota || row.Nota || row.grade || row.Grade)
      const periodId = row.periodoId || row.periodId || null

      if (!documentId || !courseName || isNaN(grade)) {
        result.errors.push({ row: rowNum, message: "Faltan campos requeridos (dni, curso, nota)" })
        continue
      }

      const { data: student } = await admin
        .from("Student")
        .select("id")
        .eq("institutionId", institutionId)
        .eq("documentId", documentId)
        .maybeSingle()

      if (!student) {
        result.errors.push({ row: rowNum, message: `Estudiante con DNI ${documentId} no encontrado` })
        continue
      }

      const { data: course } = await admin
        .from("Course")
        .select("id")
        .eq("institutionId", institutionId)
        .eq("name", courseName)
        .maybeSingle()

      if (!course) {
        result.errors.push({ row: rowNum, message: `Curso "${courseName}" no encontrado` })
        continue
      }

      const { error } = await admin.from("GradeRecord").insert({
        studentId: student.id,
        courseId: course.id,
        teacherId,
        grade,
        evaluationName,
        evaluationDate: new Date().toISOString().split("T")[0],
        periodId: periodId || null,
        weight: 1.0,
      })

      if (error) {
        result.errors.push({ row: rowNum, message: error.message })
      } else {
        result.success++
      }
    } catch (err: any) {
      result.errors.push({ row: rowNum, message: err.message })
    }
  }

  return result
}
