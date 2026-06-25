"use client"

import { useState } from "react"
import { Modal } from "@heroui/react"

const dayLabels: Record<number, string> = {
  1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes",
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

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

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
    <h2>${child.firstName} ${child.lastName} — ${child.grade?.name ?? "—"} · ${child.section?.name ?? "—"}</h2>`
    for (const day of days) {
      const dayScheds = child.schedules.filter((s) => s.dayName === day)
      if (dayScheds.length === 0) continue
      html += `<h3>${day}</h3><table><thead><tr><th>Inicio</th><th>Fin</th><th>Turno</th><th>Curso</th><th>Profesor</th><th>Aula</th></tr></thead><tbody>`
      for (const s of dayScheds) {
        html += `<tr><td>${s.startTime}</td><td>${s.endTime}</td><td>${s.shift}</td><td>${s.course.name}</td><td>${s.teacherName}</td><td>${s.classroom ?? "—"}</td></tr>`
      }
      html += `</tbody></table>`
    }
    html += `</body></html>`
    printWin.document.write(html)
    printWin.document.close()
    setTimeout(() => printWin.print(), 300)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horarios</h1>
          <p className="mt-1 text-sm text-gray-500">Horario semanal de clases</p>
        </div>
      </div>

      {childrenData.length === 0 && (
        <div className="mt-12 text-center text-gray-500">No hay estudiantes vinculados.</div>
      )}

      <div className="mt-6 space-y-8">
        {childrenData.map((child) => {
          const byDay: Record<string, ScheduleItem[]> = {}
          for (const d of days) byDay[d] = []
          for (const s of child.schedules) {
            if (byDay[s.dayName]) byDay[s.dayName].push(s)
          }

          return (
            <section key={child.id}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">
                  {child.firstName} {child.lastName}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {child.grade?.name ?? "—"} · {child.section?.name ?? "—"}
                  </span>
                </h2>
                <button
                  onClick={() => handlePrint(child)}
                  className="rounded-[30px] border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Imprimir
                </button>
              </div>

              {child.schedules.length === 0 ? (
                <p className="text-sm text-gray-500">No hay horarios registrados.</p>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-[30px] overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="hidden md:table-header-group border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">Día</th>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">Turno</th>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">Horario</th>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">Curso</th>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">Profesor</th>
                        <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">Aula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 md:divide-y-0">
                      {days.map((day) => {
                        const daySchedules = byDay[day] ?? []
                        if (daySchedules.length === 0) {
                          return (
                            <tr key={day} className="flex flex-col md:table-row border border-gray-100 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0">
                              <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 font-medium">
                                <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Día</span>
                                <span className="text-gray-500">{day}</span>
                              </td>
                              <td colSpan={5} className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                                <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Clases</span>
                                <span>Sin clases</span>
                              </td>
                            </tr>
                          )
                        }
                        return daySchedules.map((s, idx) => (
                          <tr
                            key={`${day}-${s.id}`}
                            onClick={() => { setDetail(s); setDetailChild(child) }}
                            className="flex flex-col md:table-row border border-gray-100 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0 cursor-pointer hover:bg-gray-100/50 transition-colors"
                          >
                            {idx === 0 && (
                              <td rowSpan={daySchedules.length} className="hidden md:table-cell px-6 py-4 font-medium">{day}</td>
                            )}
                            <td className="md:hidden flex justify-between px-0 py-1">
                              <span className="text-xs uppercase tracking-widest text-gray-500">Día</span>
                              <span>{day}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Turno</span>
                              <span className={`text-xs font-semibold uppercase ${s.shift === "MAÑANA" ? "text-amber-600" : "text-blue-600"}`}>{s.shift}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Horario</span>
                              <span>{s.startTime} – {s.endTime}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Curso</span>
                              <span>{s.course.name}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Profesor</span>
                              <span>{s.teacherName ?? "—"}</span>
                            </td>
                            <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                              <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Aula</span>
                              <span>{s.classroom ?? "—"}</span>
                            </td>
                          </tr>
                        ))
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}
      </div>

      {detail && (
        <Modal isOpen onOpenChange={(v) => { if (!v) setDetail(null) }}>
          <Modal.Backdrop />
          <Modal.Container size="lg" scroll="outside">
            <Modal.Dialog className="z-[60]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Detalle del Horario</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Estudiante</p>
                      <p className="font-medium">{detailChild?.firstName} {detailChild?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Día</p>
                      <p className="font-medium">{detail.dayName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Turno</p>
                      <p className="font-medium">{detail.shift}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Inicio – Fin</p>
                      <p className="font-medium">{detail.startTime} – {detail.endTime}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Curso</p>
                    <p className="font-medium text-lg">{detail.course.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Profesor</p>
                      <p className="font-medium">{detail.teacherName ?? "—"}</p>
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
    </div>
  )
}
