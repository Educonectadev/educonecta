import { NextResponse } from "next/server"
import { getInstallerStorage, getInstallerFilename, detectPlatform } from "@/lib/storage"

const validRoles = ["dev", "director", "docente", "padre", "alumno"]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ role: string }> },
) {
  const role = (await params).role
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform") || detectPlatform(request.headers.get("user-agent") || "")
  const validPlatforms = ["win", "linux", "mac"]
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ error: "Plataforma no soportada" }, { status: 400 })
  }

  const storage = getInstallerStorage()
  const result = await storage.getInstaller(role, platform as any)

  if (!result) {
    return NextResponse.json(
      { error: "Instalador no disponible para esta plataforma" },
      { status: 404 },
    )
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Content-Length": String(result.buffer.length),
    },
  })
}
