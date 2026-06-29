import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { uploadFile } from "@/lib/storage"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
    }

    const result = await uploadFile(
      session.user.institutionId,
      file,
      file.name,
      file.type,
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[files/upload] error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
