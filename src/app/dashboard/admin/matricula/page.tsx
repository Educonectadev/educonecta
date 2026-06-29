"use client"

import { useState } from "react"
import { FileSpreadsheet, Download, Upload, Search } from "lucide-react"

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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-white">Matrícula</h1>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Matrícula masiva desde Excel</h2>
        <p className="text-sm text-zinc-400">
          Sube un archivo Excel con los datos de los estudiantes para matricularlos automáticamente.
          Columnas requeridas: nombres, apellidos, dni, grado, seccion
        </p>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-zinc-400 file:mr-3 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:text-zinc-300 hover:file:bg-zinc-700"
          />
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {loading ? "Procesando..." : "Importar"}
          </button>
          <a
            href="data:text/csv;charset=utf-8,%EF%BB%BFnombres,apellidos,dni,grado,seccion%0A"
            download="plantilla-matricula.csv"
            className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:text-white"
          >
            <Download className="w-4 h-4" />
            Plantilla
          </a>
        </div>
        {result && <p className="text-sm text-emerald-400">{result}</p>}
      </div>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Matrícula individual</h2>
        <p className="text-sm text-zinc-400">
          Busca un estudiante por DNI o nombres para matriculario en un grado y sección específicos.
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              placeholder="Buscar por DNI, nombres o apellidos..."
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500"
            />
          </div>
          <button className="rounded-xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-300 hover:text-white">
            Buscar
          </button>
        </div>
      </div>
    </div>
  )
}
