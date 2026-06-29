"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, type Variants } from "framer-motion"
import { Save, Building2, Calendar, GraduationCap, Plus, X } from "lucide-react"
import { toast } from "@heroui/react"

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

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-zinc-800" />
      <div className="h-4 w-96 rounded-lg bg-gray-200 dark:bg-zinc-800" />
      <div className="h-48 rounded-2xl bg-gray-100 dark:bg-zinc-900" />
      <div className="h-64 rounded-2xl bg-gray-100 dark:bg-zinc-900" />
    </div>
  )
}

export default function InstitutionConfigPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<InstitutionSettings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/institution-config")
      .then((r) => r.json())
      .then(setSettings)
  }, [])

  if (!settings) return <div className="max-w-3xl mx-auto p-6"><Skeleton /></div>

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/institution-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        toast.success("Configuración guardada")
        router.refresh()
      } else {
        toast.danger("Error al guardar la configuración")
      }
    } catch {
      toast.danger("Error de conexión")
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
    <motion.div
      className="max-w-3xl mx-auto p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Building2 className="w-6 h-6 text-emerald-500" />
            Configuración de la Institución
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Administra los ajustes generales de tu institución
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary inline-flex items-center gap-2 rounded-[30px] px-6 py-2.5 text-sm font-medium disabled:opacity-40"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </motion.div>

      <motion.section
        variants={itemVariants}
        className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 space-y-4"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 text-emerald-500" />
          Años Académicos
        </h2>
        <div className="flex flex-wrap gap-2">
          {settings.academicYears.map((year) => (
            <span
              key={year}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-zinc-800 px-3.5 py-1.5 text-sm font-medium text-gray-700 dark:text-zinc-300"
            >
              {year}
              <button onClick={() => removeYear(year)} className="text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button
            onClick={addYear}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 dark:border-zinc-700 px-3.5 py-1.5 text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:border-gray-400 dark:hover:border-zinc-500 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar año
          </button>
        </div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 space-y-5"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <GraduationCap className="w-5 h-5 text-emerald-500" />
          Sistema de Evaluación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo de períodos</label>
            <select
              value={settings.evaluationSystem.periods}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  evaluationSystem: { ...settings.evaluationSystem, periods: e.target.value },
                })
              }
              className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-800 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            >
              <option value="bimester">Bimestres</option>
              <option value="trimester">Trimestres</option>
              <option value="semester">Semestres</option>
              <option value="quarter">Cuatrimestres</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Períodos por año</label>
            <input
              type="number"
              value={settings.evaluationSystem.periodsPerYear}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  evaluationSystem: { ...settings.evaluationSystem, periodsPerYear: Number(e.target.value) },
                })
              }
              className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-800 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo de escala</label>
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
              className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-800 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            >
              <option value="numeric">Numérica (0-20)</option>
              <option value="literal">Literal (AD/A/B/C)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nota mínima aprobatoria</label>
            <input
              type="number"
              value={settings.evaluationSystem.gradeScale.passing}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  evaluationSystem: {
                    ...settings.evaluationSystem,
                    gradeScale: { ...settings.evaluationSystem.gradeScale, passing: Number(e.target.value) },
                  },
                })
              }
              className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-800 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo de promedio</label>
            <select
              value={settings.evaluationSystem.weightType}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  evaluationSystem: { ...settings.evaluationSystem, weightType: e.target.value },
                })
              }
              className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-zinc-800 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            >
              <option value="average">Promedio simple</option>
              <option value="weighted">Promedio ponderado</option>
            </select>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
