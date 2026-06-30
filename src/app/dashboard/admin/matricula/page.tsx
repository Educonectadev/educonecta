"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { getIcon } from "@/components/premium/iconRegistry"
import { GooeyInput } from "@/components/ui/gooey-input"

export default function MatriculaPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "students")
    const res = await fetch("/api/admin/bulk-import", { method: "POST", body: formData })
    const data = await res.json()
    setResult(`${data.success} estudiantes matriculados${data.errors.length > 0 ? `, ${data.errors.length} errores` : ""}`)
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
      <div className="mb-8">
        <p className="sa-eyebrow">Gestión académica</p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Matrícula</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">
        <div className="sa-surface p-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Matrícula masiva desde Excel</h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Sube un archivo Excel con los datos de los estudiantes para matricularlos automáticamente.
            Columnas requeridas: nombres, apellidos, dni, grado, seccion
          </p>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm sa-input file:mr-3 file:rounded-xl file:border-0 file:px-4 file:py-2 file:text-sm"
              style={{ color: "var(--muted-foreground)" }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleUpload}
              disabled={!file || loading}
              className="sa-btn flex items-center gap-2"
              style={{ background: "var(--accent)", color: "var(--background)", border: "1px solid var(--accent)" }}
            >
              {getIcon("file_upload", { size: 16 })}
              {loading ? "Procesando..." : "Importar"}
            </motion.button>
            <motion.a
              whileTap={{ scale: 0.97 }}
              href="data:text/csv;charset=utf-8,%EF%BB%BFnombres,apellidos,dni,grado,seccion%0A"
              download="plantilla-matricula.csv"
              className="sa-btn sa-btn-ghost flex items-center gap-2"
            >
              {getIcon("download", { size: 16 })}
              Plantilla
            </motion.a>
          </div>
          {result && <p className="text-sm" style={{ color: "var(--accent)" }}>{result}</p>}
        </div>

        <div className="sa-surface p-6 space-y-4 overflow-hidden">
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Matrícula individual</h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Busca un estudiante por DNI o nombres para matriculario en un grado y sección específicos.
          </p>
          <div className="flex justify-center md:justify-start">
            <GooeyInput
              placeholder="Buscar por DNI, nombres o apellidos..."
              expandedWidth={320}
              expandedOffset={60}
              className="max-w-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
