import { NextResponse } from "next/server"

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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://educonecta.pe"

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
      flex-direction: column;
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
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #7b8a78;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    p { font-size: 14px; color: #6b6b6b; margin-bottom: 32px; }
    .field {
      text-align: left;
      margin-bottom: 16px;
    }
    .field label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #6b6b6b;
      margin-bottom: 6px;
    }
    .field input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #e5e4e2;
      border-radius: 16px;
      font-size: 14px;
      background: white;
      color: #1a1a1a;
    }
    button {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 999px;
      background: #1a1a1a;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
    }
    button:hover { background: #333; }
    .footer {
      margin-top: 32px;
      font-size: 12px;
      color: #a0a0a0;
      text-align: center;
    }
    .footer a { color: #7b8a78; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎓</div>
    <p class="badge">${r.title}</p>
    <h1>EduConecta</h1>
    <p>Inicia sesión en tu panel de ${r.name.toLowerCase()}</p>
    <form onsubmit="event.preventDefault(); window.location.href='${baseUrl}/login'">
      <div class="field">
        <label>Correo electrónico</label>
        <input type="email" value="${r.email}" readonly>
      </div>
      <div class="field">
        <label>Contraseña</label>
        <input type="password" value="${r.password}" readonly>
      </div>
      <button type="submit">Ir al Login</button>
    </form>
    <div class="footer">
      <p>EduConecta — Plataforma Educativa</p>
      <p><a href="${baseUrl}">${baseUrl}</a></p>
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="educonecta-${key}-login.html"`,
    },
  })
}
