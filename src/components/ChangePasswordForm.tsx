"use client"

import { useState } from "react"

export default function ChangePasswordForm({ apiEndpoint }: { apiEndpoint: string }) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (next.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }
    if (next !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "No se pudo cambiar la contraseña")
        return
      }
      setSuccess(true)
      setCurrent("")
      setNext("")
      setConfirm("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">Cambiar contraseña</h2>
      <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">Usa al menos 6 caracteres.</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3 max-w-md">
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          placeholder="Contraseña actual"
          className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white/90 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors"
        />
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          placeholder="Nueva contraseña"
          className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white/90 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Confirmar nueva contraseña"
          className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white/90 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors"
        />
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 dark:text-green-400">Contraseña actualizada correctamente</p>
        )}
        <button type="submit" disabled={loading} className="rounded-[30px] bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white transition-colors duration-200 px-6 py-2.5 text-sm font-medium disabled:opacity-50">
          {loading ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </section>
  )
}
