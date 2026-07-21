"use client"

import { useState } from "react"
import { Modal } from "@heroui/react"
import { motion } from "framer-motion"

const dayLabels: Record<number, string> = {
  1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes",
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "—"
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

interface Schedule {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  classroom: string | null
  shift: string
  course: { id: number; name: string }
  teacher: { id: number; name: string; speciality: string | null } | null
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

export default function TeacherHorariosClient({ schedules }: { schedules: Schedule[] }) {
  const [detail, setDetail] = useState<Schedule | null>(null)

  const grouped: Record<number, Schedule[]> = {}
  for (const s of schedules) {
    if (!grouped[s.dayOfWeek]) grouped[s.dayOfWeek] = []
    grouped[s.dayOfWeek].push(s)
  }

  const days = [1, 2, 3, 4, 5]

  function handlePrint() {
    const printWin = window.open("", "_blank", "noopener,noreferrer")
    if (!printWin) return
    let html = `<html><head><title>Mi Horario</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { font-size: 18px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
      th { background: #f5f5f5; font-weight: 600; }
      .day-title { font-weight: bold; margin: 16px 0 6px; font-size: 14px; }
    </style></head><body>
    <h1>Mi Horario de Clases</h1>`
    for (const d of days) {
      const dayScheds = grouped[d] || []
      if (dayScheds.length === 0) continue
      html += `<h2 class="day-title">${escapeHtml(dayLabels[d])}</h2>`
      html += `<table><thead><tr><th>Inicio</th><th>Fin</th><th>Curso</th><th>Grado</th><th>Sección</th><th>Aula</th></tr></thead><tbody>`
      for (const s of dayScheds) {
        html += `<tr><td>${escapeHtml(s.startTime)}</td><td>${escapeHtml(s.endTime)}</td><td>${escapeHtml(s.course.name)}</td><td>${escapeHtml(s.grade?.name)}</td><td>${escapeHtml(s.section?.name)}</td><td>${escapeHtml(s.classroom)}</td></tr>`
      }
      html += `</tbody></table>`
    }
    html += `</body></html>`
    printWin.document.write(html)
    printWin.document.close()
    setTimeout(() => printWin.print(), 300)
  }

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Docente / Horario</p>
          <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mi Horario</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Clases asignadas por día</p>
        </div>
        <button onClick={handlePrint} className="sa-btn sa-btn-ghost text-sm">
          Imprimir
        </button>
      </header>

      {schedules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          className="sa-surface py-14 md:py-16 text-center"
        >
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No tienes horarios asignados.</p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>
            Los horarios aparecerán aquí cuando sean asignados por el administrador.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          {days.map((d, dayIdx) => {
            const dayScheds = grouped[d] || []
            const morningScheds = dayScheds.filter((s) => s.shift === "MAÑANA")
            const eveningScheds = dayScheds.filter((s) => s.shift === "TARDE")
            return (
              <motion.div
                key={d}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: dayIdx * 0.05 }}
                className="sa-surface p-4"
              >
                <h3 className="sa-eyebrow mb-3 text-center" style={{ color: "var(--muted-foreground)" }}>{dayLabels[d]}</h3>
                {morningScheds.length === 0 && eveningScheds.length === 0 ? (
                  <p className="text-[11px] uppercase tracking-wider text-center py-4" style={{ color: "var(--muted-foreground)" }}>Sin clases</p>
                ) : (
                  <>
                    {morningScheds.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Mañana</p>
                        <div className="space-y-2">
                          {morningScheds.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => setDetail(s)}
                              className="rounded-xl p-3 border cursor-pointer transition-all"
                              style={{ background: "var(--surface-2)", borderColor: "var(--surface-border)" }}
                            >
                              <p className="font-semibold text-xs" style={{ color: "var(--foreground)" }}>{s.course.name}</p>
                              <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>{s.startTime} – {s.endTime}</p>
                              <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{s.grade?.name ?? "—"} · {s.section?.name ?? "—"}</p>
                              {s.classroom && <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Aula: {s.classroom}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {eveningScheds.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Tarde</p>
                        <div className="space-y-2">
                          {eveningScheds.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => setDetail(s)}
                              className="rounded-xl p-3 border cursor-pointer transition-all"
                              style={{ background: "var(--surface-2)", borderColor: "var(--surface-border)" }}
                            >
                              <p className="font-semibold text-xs" style={{ color: "var(--foreground)" }}>{s.course.name}</p>
                              <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>{s.startTime} – {s.endTime}</p>
                              <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{s.grade?.name ?? "—"} · {s.section?.name ?? "—"}</p>
                              {s.classroom && <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Aula: {s.classroom}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {detail && (
        <Modal isOpen onOpenChange={(v) => { if (!v) setDetail(null) }}>
          <Modal.Backdrop />
          <Modal.Container size="cover" scroll="outside">
              <Modal.Dialog className="z-[60]" style={{ background: "var(--surface)" }}>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading style={{ color: "var(--foreground)" }}>Detalle del Horario</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Día</p>
                        <p className="font-medium" style={{ color: "var(--foreground)" }}>{dayLabels[detail.dayOfWeek]}</p>
                      </div>
                      <div>
                        <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Turno</p>
                        <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.shift}</p>
                      </div>
                      <div>
                        <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Inicio</p>
                        <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.startTime}</p>
                      </div>
                      <div>
                        <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Fin</p>
                        <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.endTime}</p>
                      </div>
                    </div>
                    <div className="border-t pt-4" style={{ borderColor: "var(--surface-border)" }}>
                      <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Curso</p>
                      <p className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>{detail.course.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Grado</p>
                        <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.grade?.name ?? "—"}</p>
                      </div>
                      <div>
                        <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Sección</p>
                        <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.section?.name ?? "—"}</p>
                      </div>
                      <div>
                        <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Aula</p>
                        <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.classroom ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                </Modal.Body>
              </Modal.Dialog>
          </Modal.Container>
        </Modal>
      )}
    </div>
  )
}
