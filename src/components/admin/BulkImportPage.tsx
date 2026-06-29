"use client"

import { useState, useRef } from "react"
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from "lucide-react"

export default function BulkImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<"students" | "grades">("students")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: number
    errors: { row: number; message: string }[]
    total: number
  } | null>(null)

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    try {
      const res = await fetch("/api/admin/bulk-import", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: 0, errors: [{ row: 0, message: "Error de conexión" }], total: 0 })
    }
    setLoading(false)
  }

  const downloadTemplate = () => {
    const headers = type === "grades"
      ? ["dni", "curso", "evaluacion", "nota", "periodoId"]
      : ["nombres", "apellidos", "dni", "grado", "seccion"]

    const BOM = "\uFEFF"
    const csv = BOM + headers.join(",") + "\n"
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = type === "grades" ? "plantilla-notas.csv" : "plantilla-estudiantes.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Carga Masiva</h1>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setType("students")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              type === "students"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Estudiantes
          </button>
          <button
            onClick={() => setType("grades")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              type === "grades"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Notas
          </button>
        </div>

        <div className="rounded-xl bg-zinc-800/50 border border-dashed border-zinc-700 p-8 text-center">
          <FileSpreadsheet className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 mb-1">
            Sube un archivo Excel (.xlsx) o CSV
          </p>
          <p className="text-xs text-zinc-600 mb-4">
            {type === "students"
              ? "Columnas: nombres, apellidos, dni, grado, seccion"
              : "Columnas: dni, curso, evaluacion, nota, periodoId"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={handleUpload}
          />
          <div className="flex justify-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {loading ? "Subiendo..." : "Seleccionar archivo"}
            </button>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white"
            >
              <Download className="w-4 h-4" />
              Plantilla
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              {result.errors.length === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-zinc-300">
                {result.success} de {result.total} registros importados
              </span>
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-xl bg-red-900/20 border border-red-800/30 p-3 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-400 font-mono">
                    Fila {e.row}: {e.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
