"use client"

import { useState, useRef, useCallback } from "react"
import { toast } from "@heroui/react"
import QrCameraScanner from "@/components/QrCameraScanner"

export default function QrAttendanceClient({ pending: initial }: { pending: any[] }) {
  const [items, setItems] = useState(initial)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [lastScanned, setLastScanned] = useState<{ ok: boolean; token: string; studentName?: string; message: string } | null>(null)
  const scanLockRef = useRef(false)

  const handleScan = useCallback((decoded: string) => {
    if (scanLockRef.current) return
    scanLockRef.current = true

    // Acepta URL completa (https://host/estudiante/<token>) o solo el token.
    let token = decoded.trim()
    const m = token.match(/\/estudiante\/([a-zA-Z0-9_-]+)/)
    if (m) token = m[1]

    if (!/^[a-zA-Z0-9_-]{6,128}$/.test(token)) {
      toast.danger("QR no válido")
      setLastScanned({ ok: false, token, message: "QR no válido" })
      setTimeout(() => (scanLockRef.current = false), 1500)
      return
    }

    // Registra la asistencia directamente desde el escaneo.
    fetch("/api/public/asistencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken: token, isPresent: true, registeredByName: "Docente (escaneo QR)" }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          toast.success("Asistencia registrada")
          setLastScanned({ ok: true, token, message: "Asistencia registrada. Esperando confirmación." })
        } else if (data?.alreadyRegistered) {
          toast("Ya había un registro de hoy para este alumno")
          setLastScanned({ ok: true, token, message: "Ya registrado hoy" })
        } else {
          toast.danger(data.error || "No se pudo registrar")
          setLastScanned({ ok: false, token, message: data.error || "Error" })
        }
      })
      .finally(() => {
        setTimeout(() => (scanLockRef.current = false), 2000)
      })
  }, [])

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

      <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">Escanear QR del alumno</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
              Apunta la cámara al QR del carnet del estudiante. Se registrará como presente y quedará pendiente de confirmación.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScannerOpen((v) => !v)}
            className="rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-medium text-gray-700 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-600 transition-colors duration-200"
          >
            {scannerOpen ? "Ocultar escáner" : "Mostrar escáner"}
          </button>
        </div>

        {scannerOpen && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 mt-3">
            <QrCameraScanner
              elementId="qr-scanner-region"
              onScan={handleScan}
              paused={!scannerOpen}
            />

            <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-2">Último escaneo</h3>
              {lastScanned ? (
                <div className={
                  "rounded-xl px-3 py-2 text-sm " +
                  (lastScanned.ok
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300")
                }>
                  <p className="font-medium">{lastScanned.message}</p>
                  <p className="mt-1 text-[11px] font-mono break-all opacity-70">{lastScanned.token}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-zinc-500">Escanea un QR para ver el resultado aquí.</p>
              )}

              <div className="mt-4">
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                  El QR del carnet apunta a <code className="text-[10px] font-mono">/estudiante/&lt;token&gt;</code>.
                  El docente queda registrado como quien tomó la asistencia y el docente la confirma luego desde esta lista.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

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