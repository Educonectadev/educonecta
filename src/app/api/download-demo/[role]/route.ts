import { NextResponse } from "next/server"

const demos: Record<string, { title: string; credentials: string }> = {
  dev: {
    title: "Demo - Panel de Desarrollo",
    credentials: "usuario: demo@dev.educonecta.pe / clave: DemoDev2026",
  },
  admin: {
    title: "Demo - Panel del Director",
    credentials: "usuario: demo@admin.educonecta.pe / clave: DemoAdmin2026",
  },
  teacher: {
    title: "Demo - Panel del Docente",
    credentials: "usuario: demo@docente.educonecta.pe / clave: DemoDocente2026",
  },
  parent: {
    title: "Demo - Panel del Padre",
    credentials: "usuario: demo@padre.educonecta.pe / clave: DemoPadre2026",
  },
  student: {
    title: "Demo - Panel del Alumno",
    credentials: "usuario: demo@alumno.educonecta.pe / clave: DemoAlumno2026",
  },
}

export async function GET(_request: Request, { params }: { params: Promise<{ role: string }> }) {
  const { role } = await params
  const demo = demos[role]

  if (!demo) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 404 })
  }

  const content = `========================================
  ${demo.title}
========================================

  Role: ${role}
  ${demo.credentials}

  URL de acceso: ${process.env.NEXT_PUBLIC_BASE_URL || "https://educonecta.pe"}/login

  Instrucciones:
  1. Ve a la URL de acceso
  2. Ingresa con las credenciales de demo
  3. Explora el dashboard diseñado para este perfil

  --------------------------------
  EduConecta — Plataforma Educativa
  © ${new Date().getFullYear()}
`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="demo-${role}.txt"`,
    },
  })
}
