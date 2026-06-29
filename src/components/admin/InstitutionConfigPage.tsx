"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Building2, Calendar, GraduationCap } from "lucide-react"

type InstitutionSettings = {
  evaluationSystem: {
    periods: string
    periodsPerYear: number
    gradeScale: { type: string; min: number; max: number; passing: number }
    weightType: string
  }
  academicYears: string[]
  shifts: { id: string; name: string; start: string; end: string }[]
}

export default function InstitutionConfigPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<InstitutionSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/admin/institution-config")
      .then((r) => r.json())
      .then(setSettings)
  }, [])

  if (!settings) return <div className="p-8 text-gray-500 dark:text-zinc-400">Cargando...</div>

  const handleSave = async () => {
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/admin/institution-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setMessage("Configuración guardada")
        router.refresh()
      } else {
        setMessage("Error al guardar")
      }
    } catch {
      setMessage("Error de red")
    }
    setSaving(false)
  }

  const addYear = () => {
    const year = String(new Date().getFullYear())
    if (!settings.academicYears.includes(year)) {
      setSettings({ ...settings, academicYears: [...settings.academicYears, year].sort() })
    }
  }

  const removeYear = (year: string) => {
    setSettings({ ...settings, academicYears: settings.academicYears.filter((y) => y !== year) })
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración de la Institución</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
      {message && (
        <div className="rounded-xl bg-gray-100 dark:bg-zinc-800 px-4 py-3 text-sm text-gray-600 dark:text-zinc-300">{message}</div>
      )}

      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 text-emerald-400" />
          Años Académicos
        </h2>
        <div className="flex flex-wrap gap-2">
          {settings.academicYears.map((year) => (
            <span
              key={year}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 text-sm text-gray-600 dark:text-zinc-300"
            >
              {year}
              <button onClick={() => removeYear(year)} className="text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400">&times;</button>
            </span>
          ))}
          <button
            onClick={addYear}
            className="rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 px-3 py-1.5 text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:border-gray-400 dark:hover:border-zinc-500"
          >
            + Agregar año
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          Sistema de Evaluación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Tipo de períodos</label>
            <select
              value={settings.evaluationSystem.periods}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  evaluationSystem: { ...settings.evaluationSystem, periods: e.target.value },
                })
              }
              className="w-full rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value="bimester">Bimestres</option>
              <option value="trimester">Trimestres</option>
              <option value="semester">Semestres</option>
              <option value="quarter">Cuatrimestres</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Períodos por año</label>
            <input
              type="number"
              value={settings.evaluationSystem.periodsPerYear}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  evaluationSystem: {
                    ...settings.evaluationSystem,
                    periodsPerYear: Number(e.target.value),
                  },
                })
              }
              className="w-full rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Tipo de escala</label>
            <select
              value={settings.evaluationSystem.gradeScale.type}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  evaluationSystem: {
                    ...settings.evaluationSystem,
                    gradeScale: { ...settings.evaluationSystem.gradeScale, type: e.target.value },
                  },
                })
              }
              className="w-full rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value="numeric">Numérica (0-20)</option>
              <option value="literal">Literal (AD/A/B/C)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Nota mínima aprobatoria</label>
            <input
              type="number"
              value={settings.evaluationSystem.gradeScale.passing}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  evaluationSystem: {
                    ...settings.evaluationSystem,
                    gradeScale: {
                      ...settings.evaluationSystem.gradeScale,
                      passing: Number(e.target.value),
                    },
                  },
                })
              }
              className="w-full rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Tipo de promedio</label>
            <select
              value={settings.evaluationSystem.weightType}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  evaluationSystem: { ...settings.evaluationSystem, weightType: e.target.value },
                })
              }
              className="w-full rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value="average">Promedio simple</option>
              <option value="weighted">Promedio ponderado</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  )
}
