import { getServerSession } from "@/lib/auth"
import { query } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) {
    return new Response("No autorizado", { status: 401 })
  }
  const url = new URL(request.url)
  const tipo = url.searchParams.get("tipo") === "notas" ? "notas" : "estudios"

  const rows = await query<any[]>(
    `SELECT s.id, s."firstName", s."lastName", s."documentId",
            g.name AS "gradeName", sec.name AS "sectionName",
            i.name AS "institutionName", i.address, i.district
     FROM Student s
     LEFT JOIN Grade g ON s."gradeId" = g.id
     LEFT JOIN Section sec ON s."sectionId" = sec.id
     LEFT JOIN Institution i ON i.id = s."institutionId"
     WHERE s.id = ?`,
    [session.user.studentId]
  )
  const s = rows[0] ?? {}
  const fullName = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()
  const today = new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })

  let extra = ""
  if (tipo === "notas") {
    const grades = await query<any[]>(
      `SELECT gr."evaluationName", gr.grade, gr."evaluationDate", c.name AS "courseName"
       FROM "GradeRecord" gr JOIN Course c ON c.id = gr."courseId"
       WHERE gr."studentId" = ?
       ORDER BY c.name, gr."evaluationDate" DESC NULLS LAST`,
      [session.user.studentId]
    )
    const byCourse = new Map<string, any[]>()
    for (const g of grades) {
      if (!byCourse.has(g.courseName)) byCourse.set(g.courseName, [])
      byCourse.get(g.courseName)!.push(g)
    }
    extra = Array.from(byCourse.entries())
      .map(([course, items]) => {
        const rows = items
          .map(
            (i) =>
              `<tr><td>${escapeHtml(i.evaluationName)}</td><td>${i.evaluationDate ? new Date(i.evaluationDate).toLocaleDateString("es-PE") : "—"}</td><td style="text-align:right">${Number(i.grade).toFixed(2)}</td></tr>`
          )
          .join("")
        return `<h3 style="margin-top:18px;color:#4338ca">${escapeHtml(course)}</h3><table><thead><tr><th>Evaluación</th><th>Fecha</th><th style="text-align:right">Nota</th></tr></thead><tbody>${rows}</tbody></table>`
      })
      .join("")
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Constancia</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;padding:40px;max-width:780px;margin:0 auto}
      h1{color:#10b981;margin:0 0 4px}
      h2{margin-top:32px;font-size:18px}
      table{width:100%;border-collapse:collapse;margin-top:8px;font-size:14px}
      th,td{border-bottom:1px solid #e5e7eb;padding:8px;text-align:left}
      .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #10b981;padding-bottom:12px}
      .info{margin-top:18px;font-size:14px;line-height:1.7}
      .footer{margin-top:48px;font-size:12px;color:#6b7280;text-align:center}
    </style>
  </head><body>
    <div class="head">
      <div>
        <h1>${escapeHtml(s.institutionName ?? "EduConecta")}</h1>
        <p style="margin:0;color:#6b7280;font-size:12px">${escapeHtml(s.address ?? "")} ${s.district ? "· " + escapeHtml(s.district) : ""}</p>
      </div>
      <div style="text-align:right;font-size:12px;color:#6b7280">${today}</div>
    </div>
    <h2>${tipo === "notas" ? "Boleta de notas" : "Constancia de estudios"}</h2>
    <div class="info">
      <p>Por la presente se hace constar que el(la) estudiante <strong>${escapeHtml(fullName)}</strong>,
      identificado(a) con documento N.° <strong>${escapeHtml(s.documentId ?? "—")}</strong>,
      ${tipo === "notas" ? "obtuvo las siguientes calificaciones" : `se encuentra matriculado(a) en el grado <strong>${escapeHtml(s.gradeName ?? "—")}</strong>, sección <strong>${escapeHtml(s.sectionName ?? "—")}</strong>`}.</p>
    </div>
    ${extra}
    <div class="footer">Documento generado por EduConecta · ${today}</div>
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