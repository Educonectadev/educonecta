import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getInstallerStorage, getElectronRole, detectPlatform } from "@/lib/storage"

export async function GET(request: Request) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const electronRole = getElectronRole(session.user.role)
  if (!electronRole) {
    return NextResponse.json({ error: "Rol sin instalador asignado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform") || detectPlatform(request.headers.get("user-agent") || "")
  const validPlatforms = ["win", "linux", "mac"]
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ error: "Plataforma no soportada" }, { status: 400 })
  }

  const storage = getInstallerStorage()
  const result = await storage.getInstaller(electronRole, platform as any)

  if (!result) {
    return NextResponse.json(
      { error: "Instalador no disponible para esta plataforma" },
      { status: 404 },
    )
  }

  return new NextResponse(result.buffer, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Content-Length": String(result.buffer.length),
    },
  })
}
