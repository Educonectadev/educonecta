import { NextResponse } from "next/server"
import JSZip from "jszip"

const roles: Record<string, { title: string; name: string; email: string; password: string }> = {
  dev: { title: "Desarrollador", name: "Dev", email: "dev@educonecta.pe", password: "Dev2026" },
  admin: { title: "Director", name: "Director", email: "director@educonecta.pe", password: "Director2026" },
  teacher: { title: "Docente", name: "Docente", email: "docente@educonecta.pe", password: "Docente2026" },
  parent: { title: "Padre de Familia", name: "Padre", email: "padre@educonecta.pe", password: "Padre2026" },
  student: { title: "Alumno", name: "Alumno", email: "alumno@educonecta.pe", password: "Alumno2026" },
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

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduConecta — ${r.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafaf8;
      padding: 24px;
    }
    .card {
      background: white;
      border: 1px solid #e5e4e2;
      border-radius: 28px;
      padding: 48px 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.04);
      text-align: center;
    }
    .icon {
      width: 56px; height: 56px;
      border-radius: 16px;
      background: #1a1a1a;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px; color: white;
    }
    .badge {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #7b8a78; margin-bottom: 8px;
    }
    h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; color: #1a1a1a; margin-bottom: 4px; }
    p.sub { font-size: 14px; color: #6b6b6b; margin-bottom: 32px; }
    .field { text-align: left; margin-bottom: 16px; }
    .field label { display: block; font-size: 13px; font-weight: 500; color: #6b6b6b; margin-bottom: 6px; }
    .field input {
      width: 100%; padding: 12px 16px;
      border: 1px solid #e5e4e2; border-radius: 16px;
      font-size: 14px; background: #f8f8f6; color: #1a1a1a;
    }
    .creds {
      margin: 20px 0; padding: 16px;
      background: #f5f7f4; border-radius: 16px;
      text-align: left;
    }
    .creds p { font-size: 12px; color: #5a6b57; margin-bottom: 4px; }
    .creds code { font-size: 13px; font-weight: 600; color: #1a1a1a; }
    button {
      width: 100%; padding: 14px; border: none;
      border-radius: 999px; background: #1a1a1a; color: white;
      font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px;
    }
    button:hover { background: #333; }
    .footer { margin-top: 32px; font-size: 12px; color: #a0a0a0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎓</div>
    <p class="badge">${r.title}</p>
    <h1>EduConecta</h1>
    <p class="sub">Panel de ${r.name}</p>
    <div class="creds">
      <p>Usuario</p>
      <code>${r.email}</code>
      <p style="margin-top:10px">Contraseña</p>
      <code>${r.password}</code>
    </div>
    <button onclick="alert('Conectando al servidor de ${r.name}...\\n\\nUsuario: ${r.email}\\nContraseña: ${r.password}')">
      Ingresar
    </button>
    <div class="footer">
      <p>EduConecta — Plataforma Educativa</p>
    </div>
  </div>
</body>
</html>`

  const readme = `========================================
  EduConecta — ${r.title}
========================================

Rol: ${r.name}
Usuario: ${r.email}
Contraseña: ${r.password}

App de escritorio:
  npm run electron:${key}

Abre el archivo index.html en tu navegador
para acceder al panel de ${r.name}.

© ${new Date().getFullYear()} EduConecta
`

  const zip = new JSZip()
  zip.file("index.html", html)
  zip.file("LEEME.txt", readme)

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="educonecta-${key}.zip"`,
    },
  })
}
