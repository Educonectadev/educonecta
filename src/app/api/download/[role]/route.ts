import { NextResponse } from "next/server"

const alias: Record<string, string> = {
  director: "admin",
  docente: "teacher",
  padre: "parent",
  alumno: "student",
}

const apps: Record<string, { title: string; credentials: string }> = {
  dev: {
    title: "Acceso Desarrollador",
    credentials: "usuario: dev@educonecta.pe / clave: Dev2026",
  },
  admin: {
    title: "Acceso Director",
    credentials: "usuario: director@educonecta.pe / clave: Director2026",
  },
  teacher: {
    title: "Acceso Docente",
    credentials: "usuario: docente@educonecta.pe / clave: Docente2026",
  },
  parent: {
    title: "Acceso Padre de Familia",
    credentials: "usuario: padre@educonecta.pe / clave: Padre2026",
  },
  student: {
    title: "Acceso Alumno",
    credentials: "usuario: alumno@educonecta.pe / clave: Alumno2026",
  },
}

export async function GET(_request: Request, { params }: { params: Promise<{ role: string }> }) {
  const { role: rawRole } = await params
  const role = alias[rawRole] ?? rawRole
  const app = apps[role]

  if (!app) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 404 })
  }

  const content = `========================================
  ${app.title}
========================================

  Rol: ${role}
  ${app.credentials}

  URL de acceso: ${process.env.NEXT_PUBLIC_BASE_URL || "https://educonecta.pe"}/login

  --------------------------------
  EduConecta — Plataforma Educativa
  © ${new Date().getFullYear()}
`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${role}-acceso.txt"`,
    },
  })
}
