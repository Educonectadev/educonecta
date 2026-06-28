import { getServerSession } from "@/lib/auth"
import { query } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT" || !session.user.parentId) {
    return new Response("No autorizado", { status: 401 })
  }

  const url = new URL(request.url)
  const tipo = url.searchParams.get("tipo") === "asistencia" ? "asistencia" : "calificaciones"
  const studentParam = url.searchParams.get("studentId")

  const parentId = session.user.parentId

  const students = await query<any[]>(
    `SELECT s.id, s."firstName", s."lastName", s."documentId",
            g.name AS "gradeName", sec.name AS "sectionName",
            i.name AS "institutionName", i.address, i.district, i.city
     FROM "ParentStudent" ps
     JOIN Student s ON s.id = ps."studentId"
     LEFT JOIN Grade g ON g."id" = s."gradeId"
     LEFT JOIN Section sec ON sec."id" = s."sectionId"
     LEFT JOIN Institution i ON i."id" = s."institutionId"
     WHERE ps."parentId" = ?
     ORDER BY s."lastName"`,
    [parentId]
  )

  const filtered = studentParam
    ? students.filter((s) => String(s.id) === String(studentParam))
    : students

  if (filtered.length === 0) return new Response("Sin datos", { status: 404 })

  const fullNameParent = session.user.name
  const today = new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })

  let bodyHtml = ""
  for (const s of filtered) {
    const fullName = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()
    if (tipo === "asistencia") {
      const att = await query<any[]>(
        `SELECT date, "isPresent", note FROM Attendance WHERE "studentId" = ? ORDER BY date DESC LIMIT 60`,
        [s.id]
      )
      const total = att.length
      const pres = att.filter((a) => a.isPresent).length
      const fal = total - pres
      const pct = total > 0 ? Math.round((pres / total) * 100) : null
      const rows = att
        .map(
          (a) =>
            `<tr><td>${new Date(a.date).toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" })}</td><td>${a.isPresent ? "Presente" : "Falta"}</td><td>${escapeHtml(a.note ?? "—")}</td></tr>`
        )
        .join("")
      bodyHtml += `
        <section class="student">
          <h2>${escapeHtml(fullName)} <small>${escapeHtml(s.gradeName ?? "")}${s.sectionName ? " · Sec. " + escapeHtml(s.sectionName) : ""} · Doc. ${escapeHtml(s.documentId ?? "—")}</small></h2>
          <div class="stats">
            <div><b>${pct ?? "—"}%</b><span>Asistencia</span></div>
            <div><b>${pres}</b><span>Presentes</span></div>
            <div><b>${fal}</b><span>Faltas</span></div>
          </div>
          <table><thead><tr><th>Fecha</th><th>Estado</th><th>Nota</th></tr></thead><tbody>${rows || '<tr><td colspan="3" style="text-align:center;color:#9ca3af">Sin registros</td></tr>'}</tbody></table>
        </section>`
    } else {
      const grades = await query<any[]>(
        `SELECT gr."evaluationName", gr.grade, gr."evaluationDate", c.name AS "courseName"
         FROM "GradeRecord" gr JOIN Course c ON c.id = gr."courseId"
         WHERE gr."studentId" = ?
         ORDER BY c.name, gr."evaluationDate" DESC NULLS LAST`,
        [s.id]
      )
      const byCourse = new Map<string, any[]>()
      for (const g of grades) {
        if (!byCourse.has(g.courseName)) byCourse.set(g.courseName, [])
        byCourse.get(g.courseName)!.push(g)
      }
      let prom = 0
      let n = 0
      const coursesHtml = Array.from(byCourse.entries())
        .map(([course, items]) => {
          const rows = items
            .map(
              (i) =>
                `<tr><td>${escapeHtml(i.evaluationName)}</td><td>${i.evaluationDate ? new Date(i.evaluationDate).toLocaleDateString("es-PE") : "—"}</td><td style="text-align:right;font-weight:600">${Number(i.grade).toFixed(2)}</td></tr>`
            )
            .join("")
          const valid = items.filter((i) => i.grade != null)
          const avg = valid.length > 0 ? valid.reduce((acc, i) => acc + Number(i.grade), 0) / valid.length : null
          if (avg !== null) { prom += avg; n++ }
          return `<h3 class="course">${escapeHtml(course)} <span>Prom. ${avg !== null ? avg.toFixed(2) : "—"}</span></h3>
          <table><thead><tr><th>Evaluación</th><th>Fecha</th><th style="text-align:right">Nota</th></tr></thead><tbody>${rows}</tbody></table>`
        })
        .join("")
      const general = n > 0 ? (prom / n).toFixed(2) : "—"
      bodyHtml += `
        <section class="student">
          <h2>${escapeHtml(fullName)} <small>${escapeHtml(s.gradeName ?? "")}${s.sectionName ? " · Sec. " + escapeHtml(s.sectionName) : ""} · Doc. ${escapeHtml(s.documentId ?? "—")} · Prom. ${general}</small></h2>
          ${coursesHtml || '<p style="color:#9ca3af;text-align:center">Sin calificaciones registradas</p>'}
        </section>`
    }
  }

  const titleText = tipo === "asistencia" ? "Reporte de Asistencia" : "Boleta de Calificaciones"
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${titleText}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#111827;padding:32px;max-width:780px;margin:0 auto;font-size:13px}
  h1{color:#f59e0b;margin:0;font-size:22px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #f59e0b;padding-bottom:12px;margin-bottom:20px}
  .head small{color:#6b7280;font-size:11px;display:block;margin-top:2px}
  .head .date{font-size:11px;color:#6b7280;text-align:right}
  .meta{margin-bottom:24px;font-size:12px;color:#374151}
  .meta b{color:#111827}
  .student{margin-bottom:32px;page-break-inside:avoid}
  .student h2{font-size:15px;color:#111827;margin:0 0 4px}
  .student h2 small{color:#6b7280;font-weight:500;font-size:11px;margin-left:6px}
  .course{font-size:13px;color:#4338ca;margin:14px 0 6px;display:flex;justify-content:space-between}
  .course span{color:#6b7280;font-weight:600;font-size:11px}
  table{width:100%;border-collapse:collapse;margin-top:4px}
  th,td{border-bottom:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px}
  th{color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
  .stats{display:flex;gap:12px;margin:8px 0 12px}
  .stats div{flex:1;background:#fef3c7;border-radius:8px;padding:8px 10px;text-align:center}
  .stats div b{display:block;font-size:18px;color:#92400e}
  .stats div span{font-size:10px;text-transform:uppercase;color:#92400e;letter-spacing:0.5px}
  .footer{margin-top:36px;font-size:11px;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb;padding-top:10px}
  @media print { body{padding:0} }
</style>
</head><body>
  <div class="head">
    <div>
      <h1>${escapeHtml(filtered[0]?.institutionName ?? "EduConecta")}</h1>
      <small>${titleText}</small>
    </div>
    <div class="date">${today}</div>
  </div>
  <div class="meta">
    <b>Apoderado:</b> ${escapeHtml(fullNameParent)}
    ${filtered.length > 1 ? `<br/><b>Estudiantes:</b> ${filtered.length}` : ""}
  </div>
  ${bodyHtml}
  <div class="footer">Documento generado por EduConecta · ${today}</div>
</body></html>`

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}