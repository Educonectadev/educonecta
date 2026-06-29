import * as XLSX from "xlsx"
import { getSupabaseAdmin } from "./supabase"

export function jsonToExcelBuffer(
  data: Record<string, unknown>[],
  sheetName = "Datos",
): Buffer {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }))
}

export async function exportStudents(
  institutionId: number,
  gradeId?: number,
): Promise<Buffer> {
  const admin = getSupabaseAdmin()

  let query = admin
    .from("Student")
    .select(`
      id, firstName, lastName, documentId, email, phone, isActive,
      grade:Grade!gradeId(name, level),
      section:Section!sectionId(name)
    `)
    .eq("institutionId", institutionId)

  if (gradeId) query = query.eq("gradeId", gradeId)

  const { data } = await query.order("lastName", { ascending: true })

  const rows = (data ?? []).map((s: any) => ({
    DNI: s.documentId,
    Apellidos: s.lastName,
    Nombres: s.firstName,
    Email: s.email || "",
    Teléfono: s.phone || "",
    Grado: s.grade?.name || "",
    Nivel: s.grade?.level || "",
    Sección: s.section?.name || "",
    Activo: s.isActive ? "Sí" : "No",
  }))

  return jsonToExcelBuffer(rows, "Estudiantes")
}

export async function exportGrades(
  institutionId: number,
  courseId: number,
  periodId?: number,
): Promise<Buffer> {
  const admin = getSupabaseAdmin()

  let query = admin
    .from("GradeRecord")
    .select(`
      id, grade, evaluationName, evaluationDate, weight,
      student:Student!studentId(firstName, lastName, documentId),
      course:Course!courseId(name)
    `)
    .eq("courseId", courseId)

  if (periodId) query = query.eq("periodId", periodId)

  const { data } = await query.order("evaluationName", { ascending: true })

  const rows = (data ?? []).map((r: any) => ({
    DNI: r.student?.documentId || "",
    Apellidos: r.student?.lastName || "",
    Nombres: r.student?.firstName || "",
    Curso: r.course?.name || "",
    Evaluación: r.evaluationName,
    Nota: r.grade,
    Peso: r.weight,
    Fecha: r.evaluationDate || "",
  }))

  return jsonToExcelBuffer(rows, "Notas")
}

export async function exportAttendance(
  institutionId: number,
  startDate: string,
  endDate: string,
  gradeId?: number,
): Promise<Buffer> {
  const admin = getSupabaseAdmin()

  let query = admin
    .from("Attendance")
    .select(`
      id, date, isPresent, note,
      student:Student!studentId(firstName, lastName, documentId, grade:Grade!gradeId(name))
    `)
    .gte("date", startDate)
    .lte("date", endDate)

  const { data } = await query.order("date", { ascending: false })

  const rows = (data ?? []).map((a: any) => ({
    DNI: a.student?.documentId || "",
    Apellidos: a.student?.lastName || "",
    Nombres: a.student?.firstName || "",
    Grado: a.student?.grade?.name || "",
    Fecha: a.date,
    Asistió: a.isPresent ? "Sí" : "No",
    Observación: a.note || "",
  }))

  return jsonToExcelBuffer(rows, "Asistencia")
}
