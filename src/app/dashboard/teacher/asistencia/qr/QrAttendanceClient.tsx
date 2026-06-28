"use client"

import { useState } from "react"
import { toast } from "@heroui/react"

export default function QrAttendanceClient({ pending: initial }: { pending: any[] }) {
  const [items, setItems] = useState(initial)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  async function confirm(id: number) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/teacher/attendance-qr?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        toast.success("Asistencia confirmada")
      } else {
        toast.danger("No se pudo confirmar")
      }
    } finally {
      setLoadingId(null)
    }
  }

  async function reject(id: number) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/teacher/attendance-qr?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        toast.success("Asistencia descartada")
      } else {
        toast.danger("No se pudo descartar")
      }
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Asistencias por QR</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {items.length} pendiente{items.length === 1 ? "" : "s"} de confirmar (registradas vía carnet digital).
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-gray-400">
          Sin registros pendientes.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {items.map((i) => (
              <li key={i.id} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90 truncate">
                    {i.firstName} {i.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {i.gradeName ?? "—"}{i.sectionName ? ` · Sec. ${i.sectionName}` : ""} · Doc. {i.documentId}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400 dark:text-zinc-500">
                    Registrado por <b className="text-gray-700 dark:text-zinc-300">{i.registeredByName ?? "—"}</b> el{" "}
                    {new Date(i.createdAt).toLocaleString("es-PE")}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className={
                    "text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-semibold " +
                    (i.isPresent
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400")
                  }>
                    {i.isPresent ? "Presente" : "Falta"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirm(i.id)}
                      disabled={loadingId === i.id}
                      className="rounded-[20px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-50"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => reject(i.id)}
                      disabled={loadingId === i.id}
                      className="rounded-[20px] border border-gray-200 hover:bg-gray-50 transition-colors duration-200 px-3 py-1.5 text-[11px] font-medium text-gray-600 disabled:opacity-50"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}