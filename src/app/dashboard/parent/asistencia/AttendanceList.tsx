"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
    <div className="space-y-8">
      {children.map((child) => {
        const records = attendanceByStudent[child.id] ?? []
        const presentCount = records.filter((r) => r.isPresent).length
        const absentCount = records.length - presentCount

        return (
          <motion.section
            key={child.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                {child.firstName} {child.lastName}
                <span className="ml-2 text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>
                  {child.grade?.name ?? "—"} &middot; {child.section?.name ?? "—"}
                </span>
              </h2>
              {records.length > 0 && (
                <div className="flex gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <span style={{ color: "var(--accent)" }}>Presente: {presentCount}</span>
                  <span style={{ color: "#ef4444" }}>Ausente: {absentCount}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>Total: {records.length}</span>
                </div>
              )}
            </div>

            {records.length === 0 ? (
              <div className="sa-surface py-10 text-center">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin registros</p>
                <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay registros de asistencia para este estudiante.</p>
              </div>
            ) : (
              <div className="sa-surface overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="hidden md:table-header-group" style={{ borderBottom: "1px solid var(--surface-border)", background: "var(--surface-2)" }}>
                    <tr>
                      <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                        Fecha
                      </th>
                      <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                        Estado
                      </th>
                      <th className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3.5" style={{ color: "var(--foreground)" }}>
                        Nota
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="flex flex-col md:table-row rounded-[var(--radius-card)] p-4 md:p-0 mb-3 md:mb-0 cursor-pointer border border-[var(--surface-border)] md:border-0"
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)" }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "" }}
                      >
                        <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                          <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Fecha</span>
                          <span style={{ color: "var(--foreground)" }}>
                            {new Date(r.date).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3">
                          <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Estado</span>
                          <span>
                            {r.isPresent ? (
                              <span className="sa-chip" style={{ color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}>Presente</span>
                            ) : (
                              <span className="sa-chip" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.12)" }}>Ausente</span>
                            )}
                          </span>
                        </td>
                        <td className="flex justify-between md:table-cell px-0 md:px-4 py-1 md:py-3" style={{ color: "var(--muted-foreground)" }}>
                          <span className="md:hidden sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Nota</span>
                          <span>{r.note ?? "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.section>
        )
      })}

      {selected && (
        <Modal isOpen onOpenChange={(v) => { if (!v) setSelected(null) }}>
          <Modal.Backdrop />
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog className="z-[60]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  <div className="flex items-start justify-between gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <span className="truncate block" style={{ color: "var(--foreground)" }}>Registro de Asistencia</span>
                      <p className="mt-1 text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(selected.date).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="sa-chip text-sm font-medium"
                      style={selected.isPresent ? { color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)" } : { color: "#ef4444", background: "rgba(239, 68, 68, 0.12)" }}>
                      {selected.isPresent ? "Presente" : "Ausente"}
                    </span>
                  </div>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-4">
                  <div>
                    <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Registrado por</p>
                    <p className="text-sm" style={{ color: "var(--foreground)" }}>{selected.teacher.user.name}</p>
                  </div>
                  {selected.note && (
                    <div>
                      <p className="sa-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Nota del docente</p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{selected.note}</p>
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
