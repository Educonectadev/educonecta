"use client"

import { useState } from "react"
import { toast } from "@heroui/react"
import { motion } from "framer-motion"

export default function StudentPerfilClient({ student, email }: { student: any; email: string }) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (next.length < 6) {
      toast.danger("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }
    if (next !== confirm) {
      toast.danger("Las contraseñas no coinciden")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/student/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.danger(data.error || "No se pudo cambiar la contraseña")
        return
      }
      toast.success("Contraseña actualizada")
      setCurrent("")
      setNext("")
      setConfirm("")
    } finally {
      setLoading(false)
    }
  }

  const fullName = `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim() || "Estudiante"

  function descargarConstancia(tipo: "estudios" | "notas") {
    const params = new URLSearchParams({ tipo })
    window.open(`/api/student/constancia?${params.toString()}`, "_blank")
  }

  function descargarCarnet() {
    window.open("/api/student/carnet", "_blank")
  }

  return (
    <div className="space-y-5 md:space-y-6 max-w-3xl">
      <header>
        <p className="sa-eyebrow" style={{ color: "#8b5cf6" }}>Cuenta</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mi perfil</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Gestiona tu información, contraseña y constancias.</p>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="sa-surface p-5 md:p-6"
      >
        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Datos personales</h2>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs" style={{ color: "var(--muted-foreground)" }}>Nombre</dt>
            <dd className="font-medium" style={{ color: "var(--foreground)" }}>{fullName}</dd>
          </div>
          <div>
            <dt className="text-xs" style={{ color: "var(--muted-foreground)" }}>Email</dt>
            <dd className="font-medium" style={{ color: "var(--foreground)" }}>{email}</dd>
          </div>
          {student?.grade?.name && (
            <div>
              <dt className="text-xs" style={{ color: "var(--muted-foreground)" }}>Grado</dt>
              <dd className="font-medium" style={{ color: "var(--foreground)" }}>{student.grade.name}</dd>
            </div>
          )}
          {student?.section?.name && (
            <div>
              <dt className="text-xs" style={{ color: "var(--muted-foreground)" }}>Sección</dt>
              <dd className="font-medium" style={{ color: "var(--foreground)" }}>{student.section.name}</dd>
            </div>
          )}
          {student?.documentId && (
            <div>
              <dt className="text-xs" style={{ color: "var(--muted-foreground)" }}>Documento</dt>
              <dd className="font-medium" style={{ color: "var(--foreground)" }}>{student.documentId}</dd>
            </div>
          )}
        </dl>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="sa-surface p-5 md:p-6"
      >
        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Cambiar contraseña</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>Usa al menos 6 caracteres.</p>
        <form onSubmit={changePassword} className="mt-4 space-y-3 max-w-md">
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            placeholder="Contraseña actual"
            className="sa-input"
          />
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            placeholder="Nueva contraseña"
            className="sa-input"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Confirmar nueva contraseña"
            className="sa-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="sa-btn sa-btn-primary"
          >
            {loading ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="sa-surface p-5 md:p-6"
      >
        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Carnet digital</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>Imprime o comparte tu carnet con QR para tomar asistencia al instante.</p>
        <button
          onClick={descargarCarnet}
          className="sa-btn sa-btn-ghost mt-4"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
          </svg>
          Descargar carnet
        </button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="sa-surface p-5 md:p-6"
      >
        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Constancias</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>Descarga tus documentos académicos en PDF.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <button
            onClick={() => descargarConstancia("estudios")}
            className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors duration-200"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Constancia de estudios</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Documento oficial del colegio.</p>
            </div>
            <svg className="size-5 shrink-0" style={{ color: "#8b5cf6" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            onClick={() => descargarConstancia("notas")}
            className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors duration-200"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Boleta de notas</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Todas tus calificaciones.</p>
            </div>
            <svg className="size-5 shrink-0" style={{ color: "#8b5cf6" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </motion.section>
    </div>
  )
}
