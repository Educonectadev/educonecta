import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const INSTALLERS_DIR = path.join(process.cwd(), "private-installers")

const roleToElectron: Record<string, string> = {
  SUPER_ADMIN: "dev",
  INSTITUTIONAL_ADMIN: "director",
  TEACHER: "docente",
  PARENT: "padre",
  STUDENT: "alumno",
}

const platformExtensions: Record<string, string> = {
  win: "-setup.exe",
  linux: ".deb",
  mac: ".dmg",
}

const contentTypes: Record<string, string> = {
  exe: "application/vnd.microsoft.portable-executable",
  deb: "application/vnd.debian.binary-package",
  dmg: "application/x-apple-diskimage",
}

function detectPlatform(userAgent: string): string {
  if (userAgent.includes("Windows")) return "win"
  if (userAgent.includes("Mac OS") || userAgent.includes("iPad") || userAgent.includes("iPhone")) return "mac"
  if (userAgent.includes("Android")) return "win"
  if (userAgent.includes("Mac")) return "mac"
  return "linux"
}

export async function GET(request: Request) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const electronRole = roleToElectron[session.user.role]
  if (!electronRole) {
    return NextResponse.json({ error: "Rol sin instalador asignado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform") || detectPlatform(request.headers.get("user-agent") || "")

  const ext = platformExtensions[platform]
  if (!ext) {
    return NextResponse.json({ error: "Plataforma no soportada" }, { status: 400 })
  }

  const filename = `educonecta-${electronRole}${ext}`
  const filePath = path.join(INSTALLERS_DIR, filename)

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: `Instalador no disponible: ${filename}` },
      { status: 404 },
    )
  }

  const buffer = await readFile(filePath)
  const extKey = ext.replace(".", "").replace("-setup", "")
  const contentType = contentTypes[extKey] || "application/octet-stream"

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  })
}
