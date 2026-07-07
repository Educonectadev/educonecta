"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { getIcon } from "@/components/premium/iconRegistry"

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
    <div className="space-y-4 md:space-y-6">
      {/* Add by URL */}
      <div className="sa-surface p-4 md:p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Agregar imagen por URL</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Pega una URL externa (CDN, Unsplash, tu servidor, etc.).</p>
        <form onSubmit={addByUrl} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com/foto.jpg"
            className="sa-input w-full sm:flex-1"
          />
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descripción (opcional)"
            className="sa-input w-full sm:w-[200px]"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="sa-btn sa-btn-primary w-full sm:w-auto"
          >
            {loading ? "…" : "Agregar"}
          </button>
        </form>
      </div>

      {/* Upload */}
      <div className="sa-surface p-4 md:p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Subir desde tu dispositivo</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Elige una foto de tu celular o computador. JPG, PNG o WebP · 2MB máx.</p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descripción (opcional)"
            className="flex-1 sa-input"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="sa-btn sa-btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {getIcon("upload", { size: 16 })}
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
          <div className="mt-4 sa-surface p-4 border-[var(--accent)]">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-40 aspect-square sm:aspect-auto sm:h-40 shrink-0 rounded-xl overflow-hidden bg-[var(--surface)]">
                <img src={pendingFile.preview} alt="Vista previa" className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 w-full">
                <p className="text-sm font-semibold truncate text-[var(--foreground)]">{pendingFile.file.name}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {(pendingFile.file.size / 1024).toFixed(1)} KB · {pendingFile.file.type || "imagen"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={confirmUpload}
                    disabled={loading}
                    className="sa-btn sa-btn-primary text-xs"
                  >
                    {loading ? "Subiendo…" : "Confirmar y agregar"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelFile}
                    disabled={loading}
                    className="sa-btn sa-btn-ghost text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image list */}
      <div className="sa-surface p-4 md:p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Imágenes actuales ({images.length})
        </h2>
        {images.length === 0 ? (
          <div className="text-center py-10 text-[var(--muted-foreground)]">
            {getIcon("eye", { size: 32, className: "mx-auto mb-2 text-[var(--muted-foreground)]" })}
            <p className="text-sm">Aún no agregaste imágenes.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group rounded-xl overflow-hidden sa-surface"
              >
                <div className="aspect-square">
                  <img src={img.url} alt={img.alt ?? ""} className="size-full object-cover" loading="lazy" />
                </div>
                {img.alt && (
                  <p className="px-2 py-1.5 text-xs truncate text-[var(--muted-foreground)]">{img.alt}</p>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  aria-label="Eliminar imagen"
                  className="absolute top-2 right-2 inline-flex items-center justify-center size-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  {getIcon("trash", { size: 14 })}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
