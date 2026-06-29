"use client"

import { Switch } from "@heroui/react"
import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"

const ALL_TYPES = [
  { key: "homework", label: "Tareas", description: "Nuevas tareas asignadas a tus hijos" },
  { key: "communications", label: "Comunicados", description: "Comunicados del colegio y docentes" },
  { key: "messages", label: "Mensajes", description: "Mensajes directos de profesores" },
  { key: "grades", label: "Calificaciones", description: "Nuevas notas y calificaciones" },
  { key: "attendance", label: "Asistencia", description: "Registros de asistencia e inasistencias" },
  { key: "discipline", label: "Disciplina", description: "Reportes de disciplina" },
  { key: "schedule", label: "Horarios", description: "Cambios en horarios" },
]

type Prefs = Record<string, boolean>

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPrefs()
  }, [])

  async function fetchPrefs() {
    try {
      const supabase = getSupabase()
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user?.email) return
      const { data: users, error } = await supabase
        .from("User")
        .select("notification_preferences")
        .eq("email", session.session.user.email)
      if (error) {
        console.warn("[prefs] fetch error (columna no existe aún?)", error)
        return
      }
      const raw = (users as any[])?.[0]?.notification_preferences
      setPrefs(raw ?? {})
    } catch (err) {
      console.error("[prefs] fetch error", err)
    } finally {
      setLoading(false)
    }
  }

  async function toggle(key: string, value: boolean) {
    setSaving(true)
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    try {
      const supabase = getSupabase()
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user?.email) return
      const { error } = await supabase
        .from("User")
        .update({ notification_preferences: next })
        .eq("email", session.session.user.email)
      if (error) console.warn("[prefs] update error (columna no existe aún?)", error)
    } catch (err) {
      console.error("[prefs] update error", err)
      fetchPrefs()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-sm text-gray-400 dark:text-zinc-500">Cargando preferencias…</div>

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 dark:text-zinc-500">
        Elige qué tipo de notificaciones deseas recibir:
      </p>
      {ALL_TYPES.map((t) => (
        <div
          key={t.key}
          className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-zinc-800 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{t.label}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">{t.description}</p>
          </div>
          <Switch
            isSelected={prefs[t.key] !== false}
            isDisabled={saving}
            onChange={(v) => toggle(t.key, v)}
            size="sm"
            aria-label={t.label}
          />
        </div>
      ))}
    </div>
  )
}
