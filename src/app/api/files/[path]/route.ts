import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getFileUrl, deleteFile } from "@/lib/storage"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string }> },
) {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const filePath = decodeURIComponent((await params).path)
    const instId = Number(filePath.split("/")[0])

    if (instId !== session.user.institutionId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const url = await getFileUrl(filePath)
    if (!url) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    return NextResponse.redirect(url)
  } catch (error: any) {
    console.error("[files/path] error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ path: string }> },
) {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const filePath = decodeURIComponent((await params).path)
    const instId = Number(filePath.split("/")[0])

    if (instId !== session.user.institutionId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    await deleteFile(filePath)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[files/path] error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
