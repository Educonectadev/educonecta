"use client"

import { useState } from "react"
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

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "alta":
    case "high":
      return "bg-black text-white border-black"
    case "media":
    case "medium":
      return "bg-gray-100 text-gray-600 border-gray-200"
    default:
      return "bg-gray-50 text-gray-400 border-gray-200"
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
        <div className="mt-12 text-center text-gray-500">
          No hay comunicados disponibles.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {communications.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="w-full text-left bg-gray-50 border border-gray-200 rounded-[25px] p-6 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1a1a1a]">{c.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
                    {c.content}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-block rounded-[30px] border px-3 py-1 text-xs font-medium ${getPriorityBadge(c.priority)}`}
                >
                  {getPriorityLabel(c.priority)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                <span>
                  {new Date(c.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-gray-200">·</span>
                <span>{c.author.name}</span>
                {c.teacher && (
                  <>
                    <span className="text-gray-200">·</span>
                    <span>Prof. {c.teacher.user.name}</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <Modal isOpen onOpenChange={(v) => { if (!v) setSelected(null) }}>
          <Modal.Backdrop />
          <Modal.Container size="lg" scroll="inside" style={{ overflowX: "hidden" }}>
            <Modal.Dialog className="z-[60]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  <div className="flex items-start justify-between gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <span className="truncate block">{selected.title}</span>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-normal">
                        <span>
                          {new Date(selected.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-gray-200">·</span>
                        <span>{selected.author.name}</span>
                        {selected.teacher && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span>Prof. {selected.teacher.user.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-block rounded-[30px] border px-3 py-1 text-xs font-medium ${getPriorityBadge(selected.priority)}`}
                    >
                      {getPriorityLabel(selected.priority)}
                    </span>
                  </div>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
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
