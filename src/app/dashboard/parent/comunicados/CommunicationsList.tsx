"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Modal } from "@heroui/react"

interface Communication {
  id: number
  title: string
  content: string
  priority: string
  type: string
  createdAt: Date
  author: { name: string }
  teacher: { user: { name: string } } | null
}

function getPriorityStyle(priority: string) {
  switch (priority) {
    case "alta":
    case "high":
      return { color: "#ef4444", background: "rgba(239, 68, 68, 0.12)" }
    case "media":
    case "medium":
      return { color: "#d97706", background: "rgba(217, 119, 6, 0.14)" }
    default:
      return { color: "var(--muted-foreground)", background: "var(--surface-3)" }
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case "alta":
    case "high":
      return "Alta"
    case "media":
    case "medium":
      return "Media"
    default:
      return "Normal"
  }
}

export default function CommunicationsList({ communications }: { communications: Communication[] }) {
  const [selected, setSelected] = useState<Communication | null>(null)

  return (
    <>
      {communications.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin comunicados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No hay comunicados disponibles.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {communications.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.02, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => setSelected(c)}
                className="w-full text-left sa-surface p-6 sa-surface-hover cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                      {c.content}
                    </p>
                  </div>
                  <span className="shrink-0 sa-chip text-xs font-medium" style={getPriorityStyle(c.priority)}>
                    {getPriorityLabel(c.priority)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <span>
                    {new Date(c.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span style={{ color: "var(--surface-border)" }}>&middot;</span>
                  <span>{c.author.name}</span>
                  {c.teacher && (
                    <>
                      <span style={{ color: "var(--surface-border)" }}>&middot;</span>
                      <span>Prof. {c.teacher.user.name}</span>
                    </>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}

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
                      <span className="truncate block" style={{ color: "var(--foreground)" }}>{selected.title}</span>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                        <span>
                          {new Date(selected.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span style={{ color: "var(--surface-border)" }}>&middot;</span>
                        <span>{selected.author.name}</span>
                        {selected.teacher && (
                          <>
                            <span style={{ color: "var(--surface-border)" }}>&middot;</span>
                            <span>Prof. {selected.teacher.user.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 sa-chip text-xs font-medium" style={getPriorityStyle(selected.priority)}>
                      {getPriorityLabel(selected.priority)}
                    </span>
                  </div>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--foreground)" }}>
                  {selected.content}
                </p>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal>
      )}
    </>
  )
}
