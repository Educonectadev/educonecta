import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { parseExcel, importStudents, importGrades } from "@/lib/bulk-import"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const type = String(formData.get("type") || "students")

    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 })
    }

    const raw = await file.arrayBuffer()
    const buffer = Buffer.from(raw)

    let rows: Record<string, unknown>[]
    try {
      rows = await parseExcel(buffer)
    } catch {
      return NextResponse.json({
        error: "No se pudo leer el archivo. Asegúrate de que sea un archivo Excel (.xlsx) o CSV válido.",
      }, { status: 400 })
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "El archivo no contiene datos" }, { status: 400 })
    }

    let result
    if (type === "grades") {
      const admin = getSupabaseAdmin()
      const { data: teacher } = await admin
        .from("Teacher")
        .select("id")
        .eq("userId", Number(session.user.id))
        .maybeSingle()

      if (!teacher) {
        return NextResponse.json({ error: "Docente no encontrado" }, { status: 400 })
      }

      result = await importGrades(session.user.institutionId, teacher.id, rows)
    } else {
      result = await importStudents(session.user.institutionId, rows)
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[bulk-import] error:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
