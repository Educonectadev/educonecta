"use client"

import { useState } from "react"
import { Modal } from "@heroui/react"

interface AttendanceRecord {
  id: number
  date: Date
  isPresent: boolean
  note: string | null
  teacher: { user: { name: string } }
}

interface ChildInfo {
  id: number
  firstName: string
  lastName: string
  grade: { name: string } | null
  section: { name: string } | null
}

export default function AttendanceList({
  children,
  attendanceByStudent,
}: {
  children: ChildInfo[]
  attendanceByStudent: Record<number, AttendanceRecord[]>
}) {
  const [selected, setSelected] = useState<AttendanceRecord | null>(null)

  return (
    <div className="mt-6 space-y-8">
      {children.map((child) => {
        const records = attendanceByStudent[child.id] ?? []
        const presentCount = records.filter((r) => r.isPresent).length
        const absentCount = records.length - presentCount

        return (
          <section key={child.id}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">
                {child.firstName} {child.lastName}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {child.grade?.name ?? "—"} · {child.section?.name ?? "—"}
                </span>
              </h2>
              {records.length > 0 && (
                <div className="flex gap-4 text-xs">
                  <span className="text-green-700">
                    Presente: {presentCount}
                  </span>
                  <span className="text-red-700">
                    Ausente: {absentCount}
                  </span>
                  <span className="text-gray-500">
                    Total: {records.length}
                  </span>
                </div>
              )}
            </div>

            {records.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay registros de asistencia.
              </p>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-[30px]">
                <table className="w-full text-left text-sm">
                  <thead className="hidden md:table-header-group border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">
                        Fecha
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">
                        Estado
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-widest">
                        Nota
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 md:divide-y-0">
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="flex flex-col md:table-row border border-gray-200 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0 cursor-pointer hover:bg-gray-100/50 transition-all duration-200"
                      >
                        <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                          <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Fecha</span>
                          <span>
                            {new Date(r.date).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                          <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Estado</span>
                          <span>
                            {r.isPresent ? (
                              <span className="text-green-700">Presente</span>
                            ) : (
                              <span className="text-red-700">Ausente</span>
                            )}
                          </span>
                        </td>
                        <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                          <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Nota</span>
                          <span>{r.note ?? "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )
      })}

      {selected && (
        <Modal isOpen onOpenChange={(v) => { if (!v) setSelected(null) }}>
          <Modal.Backdrop />
          <Modal.Container size="cover">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  <div className="flex items-start justify-between gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <span className="truncate block">Registro de Asistencia</span>
                      <p className="mt-1 text-sm text-gray-400 font-normal">
                        {new Date(selected.date).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-block rounded-[30px] border px-4 py-1.5 text-sm font-medium ${
                      selected.isPresent
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {selected.isPresent ? "Presente" : "Ausente"}
                    </span>
                  </div>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Registrado por</p>
                    <p className="text-sm text-gray-600">{selected.teacher.user.name}</p>
                  </div>
                  {selected.note && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Nota del docente</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{selected.note}</p>
                    </div>
                  )}
                </div>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal>
      )}
    </div>
  )
}
