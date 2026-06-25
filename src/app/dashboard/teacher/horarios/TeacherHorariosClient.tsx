"use client"

import { useState } from "react"
import { Modal } from "@heroui/react"

const dayLabels: Record<number, string> = {
  1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes",
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
    const printWin = window.open("", "_blank")
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
      html += `<h2 class="day-title">${dayLabels[d]}</h2>`
      html += `<table><thead><tr><th>Inicio</th><th>Fin</th><th>Curso</th><th>Grado</th><th>Sección</th><th>Aula</th></tr></thead><tbody>`
      for (const s of dayScheds) {
        html += `<tr><td>${s.startTime}</td><td>${s.endTime}</td><td>${s.course.name}</td><td>${s.grade?.name ?? "—"}</td><td>${s.section?.name ?? "—"}</td><td>${s.classroom ?? "—"}</td></tr>`
      }
      html += `</tbody></table>`
    }
    html += `</body></html>`
    printWin.document.write(html)
    printWin.document.close()
    setTimeout(() => printWin.print(), 300)
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Horario</h1>
          <p className="mt-1 text-sm text-gray-500">Clases asignadas por día</p>
        </div>
        <button onClick={handlePrint} className="rounded-[30px] border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
          Imprimir
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-[30px] p-12 text-center text-gray-500">
          No tienes horarios asignados.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          {days.map((d) => {
            const dayScheds = grouped[d] || []
            const morningScheds = dayScheds.filter((s) => s.shift === "MAÑANA")
            const eveningScheds = dayScheds.filter((s) => s.shift === "TARDE")
            return (
              <div key={d} className="bg-gray-50 border border-gray-200 rounded-[30px] p-4">
                <h3 className="font-bold text-sm mb-3 text-center">{dayLabels[d]}</h3>
                {morningScheds.length === 0 && eveningScheds.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Sin clases</p>
                ) : (
                  <>
                    {morningScheds.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] uppercase tracking-widest text-amber-600 font-semibold mb-2">MAÑANA</p>
                        <div className="space-y-2">
                          {morningScheds.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => setDetail(s)}
                              className="bg-white rounded-[20px] p-3 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                            >
                              <p className="font-medium text-sm">{s.course.name}</p>
                              <p className="text-xs text-gray-400">{s.startTime} – {s.endTime}</p>
                              <p className="text-xs text-gray-400">{s.grade?.name ?? "—"} · {s.section?.name ?? "—"}</p>
                              {s.classroom && <p className="text-xs text-gray-400">Aula: {s.classroom}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {eveningScheds.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-blue-600 font-semibold mb-2">TARDE</p>
                        <div className="space-y-2">
                          {eveningScheds.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => setDetail(s)}
                              className="bg-white rounded-[20px] p-3 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                            >
                              <p className="font-medium text-sm">{s.course.name}</p>
                              <p className="text-xs text-gray-400">{s.startTime} – {s.endTime}</p>
                              <p className="text-xs text-gray-400">{s.grade?.name ?? "—"} · {s.section?.name ?? "—"}</p>
                              {s.classroom && <p className="text-xs text-gray-400">Aula: {s.classroom}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {detail && (
        <Modal isOpen onOpenChange={(v) => { if (!v) setDetail(null) }}>
          <Modal.Backdrop />
          <Modal.Container size="cover">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Detalle del Horario</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Día</p>
                      <p className="font-medium">{dayLabels[detail.dayOfWeek]}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Turno</p>
                      <p className="font-medium">{detail.shift}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Inicio</p>
                      <p className="font-medium">{detail.startTime}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Fin</p>
                      <p className="font-medium">{detail.endTime}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Curso</p>
                    <p className="font-medium text-lg">{detail.course.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Grado</p>
                      <p className="font-medium">{detail.grade?.name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Sección</p>
                      <p className="font-medium">{detail.section?.name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Aula</p>
                      <p className="font-medium">{detail.classroom ?? "—"}</p>
                    </div>
                  </div>
                </div>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal>
      )}
    </>
  )
}
