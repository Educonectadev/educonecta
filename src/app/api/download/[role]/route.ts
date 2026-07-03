import { NextResponse } from "next/server"

const BASE = "https://github.com/Educonectadev/educonecta/releases/latest/download"

const alias: Record<string, string> = {
  admin: "director",
  teacher: "docente",
  parent: "padre",
  student: "alumno",
}

const validRoles = ["dev", "director", "docente", "padre", "alumno"]

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
    dev: "educonecta-dev.AppImage",
    director: "educonecta-director.AppImage",
    docente: "educonecta-docente.AppImage",
    padre: "educonecta-padre.AppImage",
    alumno: "educonecta-alumno.AppImage",
  },
  mac: {
    dev: "educonecta-dev.dmg",
    director: "educonecta-director.dmg",
    docente: "educonecta-docente.dmg",
    padre: "educonecta-padre.dmg",
    alumno: "educonecta-alumno.dmg",
  },
}

export async function GET(request: Request, { params }: { params: Promise<{ role: string }> }) {
  let { role } = await params
  if (alias[role]) role = alias[role]
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform") || detectPlatform(request.headers.get("user-agent") || "")

  if (platform === "android" || platform === "ios") {
    return NextResponse.json(
      {
        error: "App de escritorio no disponible en dispositivos móviles",
        pwa: "Usa la versión web desde el navegador o instala la PWA",
      },
      { status: 400 }
    )
  }

  const file = files[platform]?.[role]
  if (!file) {
    return NextResponse.json({ error: "Plataforma no soportada" }, { status: 400 })
  }

  return NextResponse.redirect(`${BASE}/${file}`, { status: 302 })
}
