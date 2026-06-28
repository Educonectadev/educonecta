import { getServerSession } from "@/lib/auth"
import { query, update, create } from "@/lib/prisma"
import QRCode from "qrcode"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function ensureQrToken(token: string | null | undefined): string {
  return token ?? crypto.randomBytes(16).toString("hex")
}

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) {
    return new Response("No autorizado", { status: 401 })
  }

  const studentId = session.user.studentId
  let rows = await query<any[]>(
    `SELECT s.id, s."firstName", s."lastName", s."documentId", s."qrToken",
            g.name AS "gradeName", sec.name AS "sectionName",
            i.name AS "institutionName", i.address, i.district, i.city
     FROM Student s
     LEFT JOIN Grade g ON s."gradeId" = g.id
     LEFT JOIN Section sec ON s."sectionId" = sec.id
     LEFT JOIN Institution i ON i.id = s."institutionId"
     WHERE s.id = ?`,
    [studentId]
  )

  if (rows.length === 0) return new Response("Alumno no encontrado", { status: 404 })

  let student = rows[0]
  let qrToken = student.qrToken
  if (!qrToken) {
    qrToken = ensureQrToken(null)
    await update("Student", { id: studentId }, { qrToken })
    student = { ...student, qrToken }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const carnetUrl = `${baseUrl}/estudiante/${qrToken}`

  const qrSvg = await QRCode.toString(carnetUrl, {
    type: "svg",
    margin: 0,
    width: 220,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  })

  const fullName = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim().toUpperCase()
  const today = new Date().toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "2-digit" })

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Carnet Estudiantil</title>
<style>
  @page { size: 85.6mm 54mm; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #000; background: #fff; }
  .card {
    width: 85.6mm;
    height: 54mm;
    padding: 4mm 5mm;
    display: grid;
    grid-template-columns: 1fr 26mm;
    gap: 3mm;
    border: 0.4mm solid #000;
    background: #fff;
  }
  .header { display: flex; align-items: center; gap: 2mm; border-bottom: 0.3mm solid #000; padding-bottom: 1.5mm; }
  .logo { width: 7mm; height: 7mm; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 9px; letter-spacing: -0.5px; border-radius: 1mm; }
  .inst { font-size: 7pt; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .inst small { display: block; font-size: 5.5pt; font-weight: 500; color: #444; text-transform: none; letter-spacing: 0; }
  .body { display: flex; flex-direction: column; justify-content: space-between; padding-top: 1.5mm; }
  .name { font-size: 10pt; font-weight: 800; line-height: 1.1; letter-spacing: -0.2px; }
  .row { font-size: 6.5pt; color: #000; display: flex; gap: 2mm; }
  .row b { font-weight: 700; }
  .qrwrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1mm; }
  .qrwrap svg { width: 22mm !important; height: 22mm !important; display: block; }
  .qrlabel { font-size: 5pt; letter-spacing: 0.4px; text-transform: uppercase; color: #000; }
  .footer { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 0.2mm solid #000; padding-top: 1mm; font-size: 5pt; color: #000; }
</style>
</head>
<body>
  <div class="card">
    <div>
      <div class="header">
        <div class="logo">EC</div>
        <div class="inst">${escapeHtml(student.institutionName ?? "EduConecta")}<small>Carnet Estudiantil · ${today}</small></div>
      </div>
      <div class="body">
        <div class="name">${escapeHtml(fullName)}</div>
        <div class="row"><b>Doc.</b><span>${escapeHtml(student.documentId ?? "—")}</span></div>
        <div class="row"><b>Grado</b><span>${escapeHtml(student.gradeName ?? "—")}${student.sectionName ? ` · Sec. ${escapeHtml(student.sectionName)}` : ""}</span></div>
        <div class="row"><b>ID</b><span>${escapeHtml(student.id)}</span></div>
      </div>
    </div>
    <div class="qrwrap">
      ${qrSvg}
      <div class="qrlabel">Escanear</div>
    </div>
    <div class="footer">
      <span>${escapeHtml(student.district ?? "")}${student.city ? " · " + escapeHtml(student.city) : ""}</span>
      <span>educonecta.pe</span>
    </div>
  </div>
</body></html>`

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}