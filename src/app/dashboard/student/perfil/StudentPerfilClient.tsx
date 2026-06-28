"use client"

import { useState } from "react"
import { toast } from "@heroui/react"

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
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mi perfil</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Gestiona tu información, contraseña y constancias.</p>
      </div>

      <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">Datos personales</h2>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-gray-400 dark:text-zinc-500">Nombre</dt>
            <dd className="font-medium text-gray-900 dark:text-white/90">{fullName}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400 dark:text-zinc-500">Email</dt>
            <dd className="font-medium text-gray-900 dark:text-white/90">{email}</dd>
          </div>
          {student?.grade?.name && (
            <div>
              <dt className="text-xs text-gray-400 dark:text-zinc-500">Grado</dt>
              <dd className="font-medium text-gray-900 dark:text-white/90">{student.grade.name}</dd>
            </div>
          )}
          {student?.section?.name && (
            <div>
              <dt className="text-xs text-gray-400 dark:text-zinc-500">Sección</dt>
              <dd className="font-medium text-gray-900 dark:text-white/90">{student.section.name}</dd>
            </div>
          )}
          {student?.documentId && (
            <div>
              <dt className="text-xs text-gray-400 dark:text-zinc-500">Documento</dt>
              <dd className="font-medium text-gray-900 dark:text-white/90">{student.documentId}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">Cambiar contraseña</h2>
        <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">Usa al menos 6 caracteres.</p>
        <form onSubmit={changePassword} className="mt-4 space-y-3 max-w-md">
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            placeholder="Contraseña actual"
            className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            placeholder="Nueva contraseña"
            className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Confirmar nueva contraseña"
            className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-[30px] bg-violet-600 hover:bg-violet-700 transition-colors duration-200 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">Carnet digital</h2>
        <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">Imprime o comparte tu carnet con QR para tomar asistencia al instante.</p>
        <button
          onClick={descargarCarnet}
          className="mt-4 inline-flex items-center gap-2 rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-2.5 text-sm font-medium text-gray-800 dark:text-zinc-200 hover:border-violet-300 hover:text-violet-600 transition-colors duration-200"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
          </svg>
          Descargar carnet
        </button>
      </section>

      <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">Constancias</h2>
        <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">Descarga tus documentos académicos en PDF.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <button
            onClick={() => descargarConstancia("estudios")}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-left hover:border-violet-300 transition-colors duration-200"
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white/90">Constancia de estudios</p>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500">Documento oficial del colegio.</p>
            </div>
            <svg className="size-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            onClick={() => descargarConstancia("notas")}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-left hover:border-violet-300 transition-colors duration-200"
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white/90">Boleta de notas</p>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500">Todas tus calificaciones.</p>
            </div>
            <svg className="size-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  )
}