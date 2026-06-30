"use client"

import { useState, useRef, useCallback } from "react"
import { toast } from "@heroui/react"
import QrCameraScanner from "@/components/QrCameraScanner"
import { motion } from "framer-motion"
import { getIcon } from "@/components/premium/iconRegistry"

export default function QrAttendanceClient({ pending: initial }: { pending: any[] }) {
  const [items, setItems] = useState(initial)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [lastScanned, setLastScanned] = useState<{ ok: boolean; token: string; studentName?: string; message: string } | null>(null)
  const scanLockRef = useRef(false)

  const handleScan = useCallback((decoded: string) => {
    if (scanLockRef.current) return
    scanLockRef.current = true

    let token = decoded.trim()
    const m = token.match(/\/estudiante\/([a-zA-Z0-9_-]+)/)
    if (m) token = m[1]

    if (!/^[a-zA-Z0-9_-]{6,128}$/.test(token)) {
      toast.danger("QR no válido")
      setLastScanned({ ok: false, token, message: "QR no válido" })
      setTimeout(() => (scanLockRef.current = false), 1500)
      return
    }

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
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <div>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Docente / Asistencia QR</p>
        <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Asistencias por QR</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {items.length} pendiente{items.length === 1 ? "" : "s"} de confirmar (registradas vía carnet digital).
        </p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        className="sa-surface p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Escanear QR del alumno</h2>
            <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              Apunta la cámara al QR del carnet del estudiante. Se registrará como presente y quedará pendiente de confirmación.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScannerOpen((v) => !v)}
            className="sa-btn sa-btn-ghost text-xs"
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

            <div className="rounded-2xl border p-4" style={{ borderColor: "var(--surface-border)", background: "var(--surface-2)" }}>
              <h3 className="sa-eyebrow mb-2" style={{ color: "var(--muted-foreground)" }}>Último escaneo</h3>
              {lastScanned ? (
                <div
                  className="rounded-xl px-3 py-2 text-sm"
                  style={
                    lastScanned.ok
                      ? { background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }
                      : { background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }
                  }
                >
                  <p className="font-medium">{lastScanned.message}</p>
                  <p className="mt-1 text-[11px] font-mono break-all opacity-70">{lastScanned.token}</p>
                </div>
              ) : (
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Escanea un QR para ver el resultado aquí.</p>
              )}

              <div className="mt-4">
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  El QR del carnet apunta a <code className="text-[10px] font-mono">/estudiante/&lt;token&gt;</code>.
                  El docente queda registrado como quien tomó la asistencia y el docente la confirma luego desde esta lista.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.section>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          className="sa-surface py-14 md:py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            {getIcon("qr_code_scanner", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin registros pendientes.</p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>Las asistencias registradas por QR aparecerán aquí para confirmación.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          className="sa-surface overflow-hidden"
        >
          <ul className="divide-y" style={{ borderColor: "var(--surface-border)" }}>
            {items.map((i, idx) => (
              <motion.li
                key={i.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const, delay: idx * 0.025 }}
                className="p-4 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                    {i.firstName} {i.lastName}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {i.gradeName ?? "—"}{i.sectionName ? ` · Sec. ${i.sectionName}` : ""} · Doc. {i.documentId}
                  </p>
                  <p className="mt-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                    Registrado por <b style={{ color: "var(--foreground)" }}>{i.registeredByName ?? "—"}</b> el{" "}
                    {new Date(i.createdAt).toLocaleString("es-PE")}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="sa-chip text-[10px] uppercase tracking-wider font-semibold"
                    style={i.isPresent ? { color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)" } : { color: "#ef4444", background: "rgba(239, 68, 68, 0.12)" }}
                  >
                    {i.isPresent ? "Presente" : "Falta"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirm(i.id)}
                      disabled={loadingId === i.id}
                      className="sa-btn sa-btn-primary text-[11px] px-3 py-1.5 disabled:opacity-50"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => reject(i.id)}
                      disabled={loadingId === i.id}
                      className="sa-btn sa-btn-ghost text-[11px] px-3 py-1.5 disabled:opacity-50"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}
