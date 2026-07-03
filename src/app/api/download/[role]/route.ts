import { NextResponse } from "next/server"
import { existsSync } from "fs"
import path from "path"

const alias: Record<string, string> = {
  admin: "director",
  teacher: "docente",
  parent: "padre",
  student: "alumno",
}

const validRoles = ["dev", "director", "docente", "padre", "alumno"]

const INSTALLERS_DIR = path.join(process.cwd(), "public", "installers")

function detectPlatform(userAgent: string): "win" | "linux" | "mac" | "android" | "ios" {
  if (userAgent.includes("Windows")) return "win"
  if (userAgent.includes("Mac OS") || userAgent.includes("iPad") || userAgent.includes("iPhone")) return "ios"
  if (userAgent.includes("Android")) return "android"
  if (userAgent.includes("Mac")) return "mac"
  return "linux"
}

const files: Record<string, Record<string, string>> = {
  win: {
    dev: "educonecta-dev-setup.exe",
    director: "educonecta-director-setup.exe",
    docente: "educonecta-docente-setup.exe",
    padre: "educonecta-padre-setup.exe",
    alumno: "educonecta-alumno-setup.exe",
  },
  linux: {
    dev: "educonecta-dev.deb",
    director: "educonecta-director.deb",
    docente: "educonecta-docente.deb",
    padre: "educonecta-padre.deb",
    alumno: "educonecta-alumno.deb",
  },
  mac: {
    dev: "educonecta-dev.dmg",
    director: "educonecta-director.dmg",
    docente: "educonecta-docente.dmg",
    padre: "educonecta-padre.dmg",
    alumno: "educonecta-alumno.dmg",
  },
  android: {
    dev: "educonecta-app.apk",
    director: "educonecta-app.apk",
    docente: "educonecta-app.apk",
    padre: "educonecta-app.apk",
    alumno: "educonecta-app.apk",
  },
}

export async function GET(request: Request, { params }: { params: Promise<{ role: string }> }) {
  let { role } = await params
  if (alias[role]) role = alias[role]
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  let platform = searchParams.get("platform") || detectPlatform(request.headers.get("user-agent") || "")

  if (platform === "ios") platform = "win"

  const file = files[platform]?.[role]
  if (!file) {
    return NextResponse.json({ error: "Plataforma no soportada" }, { status: 400 })
  }

  const localPath = path.join(INSTALLERS_DIR, file)
  if (existsSync(localPath)) {
    return NextResponse.redirect(`/installers/${file}`, { status: 302 })
  }

  return NextResponse.json(
    { error: `Archivo no encontrado: ${file}. Aún no hay instalador disponible para esta plataforma.` },
    { status: 404 },
  )
}
