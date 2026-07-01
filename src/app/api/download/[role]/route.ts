import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const roles: Record<string, { fileName: string }> = {
  dev: { fileName: "educonecta-dev-setup.exe" },
  admin: { fileName: "educonecta-admin-setup.exe" },
  teacher: { fileName: "educonecta-teacher-setup.exe" },
  parent: { fileName: "educonecta-parent-setup.exe" },
  student: { fileName: "educonecta-student-setup.exe" },
}

const alias: Record<string, string> = {
  director: "admin",
  docente: "teacher",
  padre: "parent",
  alumno: "student",
}

export async function GET(_request: Request, { params }: { params: Promise<{ role: string }> }) {
  const { role: rawRole } = await params
  const key = alias[rawRole] ?? rawRole
  const r = roles[key]

  if (!r) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 404 })
  }

  const filePath = path.join(process.cwd(), "public", "installers", r.fileName)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "Instalador no encontrado. Ejecuta: npm run electron:build:all" },
      { status: 404 }
    )
  }

  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(r.fileName)

  const mimeTypes: Record<string, string> = {
    ".exe": "application/vnd.microsoft.portable-executable",
    ".dmg": "application/x-apple-diskimage",
    ".AppImage": "application/x-executable",
    ".deb": "application/vnd.debian.binary-package",
  }

  return new NextResponse(fileBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${r.fileName}"`,
      "Content-Length": String(fileBuffer.length),
    },
  })
}
