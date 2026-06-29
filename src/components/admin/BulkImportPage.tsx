"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X, FileText, Loader2 } from "lucide-react"
import { toast } from "@heroui/react"

type ImportResult = {
  success: number
  errors: { row: number; message: string }[]
  total: number
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BulkImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<"students" | "grades">("students")
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const reset = useCallback(() => {
    setSelectedFile(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ""
  }, [])

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return
    if (!file.name.match(/\.(xlsx|csv)$/i)) {
      toast.danger("Solo se aceptan archivos .xlsx o .csv")
      return
    }
    setSelectedFile(file)
    setResult(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFileChange(e.dataTransfer.files[0])
  }, [handleFileChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragging(false), [])

  const handleUpload = async () => {
    if (!selectedFile) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("type", type)

    try {
      const res = await fetch("/api/admin/bulk-import", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        const r: ImportResult = { success: 0, errors: [{ row: 0, message: data.error || "Error del servidor" }], total: 0 }
        setResult(r)
        toast.danger(data.error || "Error del servidor")
      } else {
        setResult(data)
        if (data.errors?.length === 0) {
          toast.success(`${data.success} registros importados correctamente`)
        } else {
          toast.warning(`${data.success} de ${data.total} importados (${data.errors.length} errores)`)
        }
      }
    } catch {
      const r: ImportResult = { success: 0, errors: [{ row: 0, message: "Error de conexión" }], total: 0 }
      setResult(r)
      toast.danger("Error de conexión con el servidor")
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
    toast.success("Plantilla descargada")
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
          Carga Masiva
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-zinc-400">
          Importa estudiantes o notas desde un archivo Excel o CSV
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 space-y-5"
      >
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-[30px] w-fit">
          <button
            onClick={() => { setType("students"); reset() }}
            className={`relative rounded-[30px] px-5 py-2 text-sm font-medium transition-colors ${
              type === "students" ? "text-white" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {type === "students" && (
              <motion.span
                layoutId="type-pill"
                className="absolute inset-0 rounded-[30px] bg-emerald-600"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Estudiantes</span>
          </button>
          <button
            onClick={() => { setType("grades"); reset() }}
            className={`relative rounded-[30px] px-5 py-2 text-sm font-medium transition-colors ${
              type === "grades" ? "text-white" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {type === "grades" && (
              <motion.span
                layoutId="type-pill"
                className="absolute inset-0 rounded-[30px] bg-emerald-600"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Notas</span>
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !selectedFile && !loading && fileRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
              : selectedFile
                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/10"
                : "border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/30 hover:border-gray-400 dark:hover:border-zinc-600"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-3"
              >
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Procesando archivo...</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  {selectedFile?.name}
                </p>
              </motion.div>
            ) : selectedFile ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">{formatSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); reset() }}
                  className="text-xs text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Quitar archivo
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-gray-400 dark:text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Arrastra un archivo aquí o <span className="text-emerald-600 dark:text-emerald-400">selecciona uno</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                    {type === "students"
                      ? "Columnas: nombres, apellidos, dni, grado, seccion"
                      : "Columnas: dni, curso, evaluacion, nota, periodoId"}
                  </p>
                </div>
                <p className="text-xs text-gray-400 dark:text-zinc-600">Solo .xlsx o .csv</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="btn-primary inline-flex items-center gap-2 rounded-[30px] px-6 py-2.5 text-sm font-medium disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {loading ? "Importando..." : "Importar"}
            </button>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-[30px] border border-gray-200 dark:border-zinc-700 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
            >
              <Download className="w-4 h-4" />
              Plantilla
            </button>
          </div>

          {selectedFile && !loading && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={reset}
              className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
            >
              Cancelar
            </motion.button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              {result.errors.length === 0 ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </motion.div>
              ) : result.success > 0 ? (
                <AlertCircle className="w-8 h-8 text-amber-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-500" />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {result.errors.length === 0
                    ? "Importación completada"
                    : result.success > 0
                      ? "Importación parcial"
                      : "Error en la importación"}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {result.success} de {result.total} registros importados
                </p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-red-100 dark:border-red-900/30">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    {result.errors.length} error{result.errors.length !== 1 && "es"}
                  </p>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-red-100 dark:divide-red-900/20">
                  {result.errors.map((e, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-start gap-2">
                      <span className="text-xs font-mono text-red-400 dark:text-red-500 shrink-0 mt-0.5">
                        #{e.row}
                      </span>
                      <p className="text-xs text-red-600 dark:text-red-400">{e.message}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="text-center">
        <p className="text-xs text-gray-400 dark:text-zinc-600">
          Formatos soportados: Excel (.xlsx) y CSV (.csv)
        </p>
      </motion.div>
    </motion.div>
  )
}
