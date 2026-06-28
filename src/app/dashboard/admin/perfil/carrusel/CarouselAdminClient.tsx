"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"

interface CarouselImage {
  id: number
  url: string
  alt: string | null
  order: number
}

export default function CarouselAdminClient({ initialImages }: { initialImages: CarouselImage[] }) {
  const router = useRouter()
  const [images, setImages] = useState<CarouselImage[]>(initialImages)
  const [url, setUrl] = useState("")
  const [alt, setAlt] = useState("")
  const [loading, setLoading] = useState(false)
  const [pendingFile, setPendingFile] = useState<{ file: File; preview: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function addByUrl(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/carousel-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), alt: alt.trim() || null }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.danger(data.error || "No se pudo guardar")
        return
      }
      setImages((prev) => [...prev, data])
      setUrl("")
      setAlt("")
      toast.success("Imagen agregada")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  function onFileSelected(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.danger("Solo se permiten imágenes")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.danger("La imagen no debe superar 2MB")
      return
    }
    const preview = URL.createObjectURL(file)
    setPendingFile({ file, preview })
  }

  function cancelFile() {
    if (pendingFile) URL.revokeObjectURL(pendingFile.preview)
    setPendingFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function confirmUpload() {
    if (!pendingFile) return
    setLoading(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(pendingFile.file)
      })
      const res = await fetch("/api/admin/carousel-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: dataUrl, alt: alt.trim() || pendingFile.file.name }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.danger(data.error || "No se pudo subir")
        return
      }
      setImages((prev) => [...prev, data])
      cancelFile()
      setAlt("")
      toast.success("Imagen subida")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar esta imagen?")) return
    try {
      const res = await fetch(`/api/admin/carousel-images?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setImages((prev) => prev.filter((i) => i.id !== id))
        toast.success("Imagen eliminada")
        router.refresh()
      } else {
        toast.danger("No se pudo eliminar")
      }
    } catch {
      toast.danger("Error de red")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">Agregar imagen por URL</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Pega una URL externa (CDN, Unsplash, tu servidor, etc.).</p>
        <form onSubmit={addByUrl} className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com/foto.jpg"
            className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "…" : "Agregar"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">Subir desde tu dispositivo</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Elige una foto de tu celular o computador. JPG, PNG o WebP · 2MB máx.</p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descripción (opcional)"
            className="flex-1 rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {pendingFile ? "Cambiar imagen" : "Subir imagen"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={loading}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFileSelected(f)
          }}
        />

        {pendingFile && (
          <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900">
                <img src={pendingFile.preview} alt="Vista previa" className="size-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{pendingFile.file.name}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                  {(pendingFile.file.size / 1024).toFixed(1)} KB · {pendingFile.file.type || "imagen"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={confirmUpload}
                    disabled={loading}
                    className="rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 px-5 py-2 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {loading ? "Subiendo…" : "Confirmar y agregar"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelFile}
                    disabled={loading}
                    className="rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2 text-xs font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
          Imágenes actuales ({images.length})
        </h2>
        {images.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400 dark:text-zinc-500">Aún no agregaste imágenes.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img) => (
              <li key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40">
                <div className="aspect-square">
                  <img src={img.url} alt={img.alt ?? ""} className="size-full object-cover" loading="lazy" />
                </div>
                {img.alt && (
                  <p className="px-2 py-1.5 text-[11px] text-gray-600 dark:text-zinc-400 truncate">{img.alt}</p>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  aria-label="Eliminar imagen"
                  className="absolute top-2 right-2 inline-flex items-center justify-center size-8 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors backdrop-blur"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6 17.5 20a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}