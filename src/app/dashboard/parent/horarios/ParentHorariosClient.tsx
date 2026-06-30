"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Modal, Table } from "@heroui/react"

const dayLabels: Record<number, string> = {
  1: "Lunes", 2: "Martes", 3: "Mi&eacute;rcoles", 4: "Jueves", 5: "Viernes",
}

interface ScheduleItem {
  id: number
  dayOfWeek: number
  dayName: string
  startTime: string
  endTime: string
  shift: string
  classroom: string | null
  course: { id: number; name: string }
  teacherName: string
}

interface ChildData {
  id: number
  firstName: string
  lastName: string
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
  schedules: ScheduleItem[]
}

export default function ParentHorariosClient({ childrenData }: { childrenData: ChildData[] }) {
  const [detail, setDetail] = useState<ScheduleItem | null>(null)
  const [detailChild, setDetailChild] = useState<ChildData | null>(null)

  const days = ["Lunes", "Martes", "Mi&eacute;rcoles", "Jueves", "Viernes", "S&aacute;bado", "Domingo"]

  function handlePrint(child: ChildData) {
    const printWin = window.open("", "_blank")
    if (!printWin) return
    let html = `<html><head><title>Horario - ${child.firstName} ${child.lastName}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      h2 { font-size: 14px; margin-bottom: 20px; color: #666; font-weight: normal; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
      th { background: #f5f5f5; font-weight: 600; }
    </style></head><body>
    <h1>Horario de Clases</h1>
    <h2>${child.firstName} ${child.lastName} &mdash; ${child.grade?.name ?? "&mdash;"} &middot; ${child.section?.name ?? "&mdash;"}</h2>`
    for (const day of days) {
      const dayScheds = child.schedules.filter((s) => s.dayName === day)
      if (dayScheds.length === 0) continue
      html += `<h3>${day}</h3><table><thead><tr><th>Inicio</th><th>Fin</th><th>Turno</th><th>Curso</th><th>Profesor</th><th>Aula</th></tr></thead><tbody>`
      for (const s of dayScheds) {
        html += `<tr><td>${s.startTime}</td><td>${s.endTime}</td><td>${s.shift}</td><td>${s.course.name}</td><td>${s.teacherName}</td><td>${s.classroom ?? "&mdash;"}</td></tr>`
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
      <header>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Horarios</p>
        <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Horarios</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Horario semanal de clases</p>
      </header>

      {childrenData.length === 0 && (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin estudiantes vinculados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay estudiantes vinculados.</p>
        </div>
      )}

      <div className="space-y-8">
        {childrenData.map((child) => {
          const byDay: Record<string, ScheduleItem[]> = {}
          for (const d of days) byDay[d] = []
          for (const s of child.schedules) {
            if (byDay[s.dayName]) byDay[s.dayName].push(s)
          }

          return (
            <motion.section
              key={child.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                  {child.firstName} {child.lastName}
                  <span className="ml-2 text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>
                    {child.grade?.name ?? "—"} &middot; {child.section?.name ?? "—"}
                  </span>
                </h2>
                <button
                  onClick={() => handlePrint(child)}
                  className="sa-btn sa-btn-outline text-xs"
                >
                  Imprimir
                </button>
              </div>

              {child.schedules.length === 0 ? (
                <div className="sa-surface py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin horarios</p>
                  <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay horarios registrados.</p>
                </div>
              ) : (
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content className="min-w-[600px]">
                      <Table.Header>
                        <Table.Column>Día</Table.Column>
                        <Table.Column>Turno</Table.Column>
                        <Table.Column>Horario</Table.Column>
                        <Table.Column>Curso</Table.Column>
                        <Table.Column>Profesor</Table.Column>
                        <Table.Column>Aula</Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {days.flatMap((day) => {
                          const daySchedules = byDay[day] ?? []
                          if (daySchedules.length === 0) {
                            return [(
                              <Table.Row key={day}>
                                <Table.Cell>{day}</Table.Cell>
                                <Table.Cell>—</Table.Cell>
                                <Table.Cell>—</Table.Cell>
                                <Table.Cell>Sin clases</Table.Cell>
                                <Table.Cell>—</Table.Cell>
                                <Table.Cell>—</Table.Cell>
                              </Table.Row>
                            )]
                          }
                          return daySchedules.map((s) => (
                            <Table.Row
                              key={`${day}-${s.id}`}
                              onAction={() => { setDetail(s); setDetailChild(child) }}
                            >
                              <Table.Cell>{day}</Table.Cell>
                              <Table.Cell>
                                <span className="text-xs font-semibold uppercase"
                                  style={{ color: s.shift === "MAÑANA" || s.shift === "MA&Ntilde;ANA" ? "#d97706" : "var(--accent)" }}>
                                  {s.shift}
                                </span>
                              </Table.Cell>
                              <Table.Cell>{s.startTime} &ndash; {s.endTime}</Table.Cell>
                              <Table.Cell>{s.course.name}</Table.Cell>
                              <Table.Cell>{s.teacherName ?? "—"}</Table.Cell>
                              <Table.Cell>{s.classroom ?? "—"}</Table.Cell>
                            </Table.Row>
                          ))
                        })}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              )}
            </motion.section>
          )
        })}
      </div>

      {detail && (
        <Modal isOpen onOpenChange={(v) => { if (!v) setDetail(null) }}>
          <Modal.Backdrop />
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog className="z-[60]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading style={{ color: "var(--foreground)" }}>Detalle del Horario</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Estudiante</p>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>{detailChild?.firstName} {detailChild?.lastName}</p>
                    </div>
                    <div>
                      <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>D&iacute;a</p>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.dayName}</p>
                    </div>
                    <div>
                      <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Turno</p>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.shift}</p>
                    </div>
                    <div>
                      <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Inicio &ndash; Fin</p>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.startTime} &ndash; {detail.endTime}</p>
                    </div>
                  </div>
                  <div className="pt-4" style={{ borderTop: "1px solid var(--surface-border)" }}>
                    <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Curso</p>
                    <p className="font-medium text-lg" style={{ color: "var(--foreground)" }}>{detail.course.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Profesor</p>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>{detail.teacherName ?? "—"}</p>
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
