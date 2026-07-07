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
    <div className="space-y-4">
      {/* Add by URL */}
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Agregar imagen por URL</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Pega una URL externa (CDN, Unsplash, etc.).</p>
        <form onSubmit={addByUrl} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com/foto.jpg"
            className="w-full sm:flex-1 bg-[var(--surface-2)] border border-[var(--surface-border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descripción"
            className="w-full sm:w-[180px] bg-[var(--surface-2)] border border-[var(--surface-border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full sm:w-auto bg-[var(--accent)] text-white rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "…" : "Agregar"}
          </button>
        </form>
      </div>

      {/* Upload */}
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Subir desde tu dispositivo</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">JPG, PNG o WebP · 2MB máx.</p>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descripción (opcional)"
            className="flex-1 bg-[var(--surface-2)] border border-[var(--surface-border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--accent)] transition-colors"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full sm:w-auto bg-[var(--accent)] text-white rounded-xl px-5 py-2 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {getIcon("upload", { size: 16 })}
            {pendingFile ? "Cambiar" : "Subir"}
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
          <div className="mt-4 border border-[var(--accent)] rounded-2xl p-4 bg-[var(--surface)]">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-36 aspect-square rounded-xl overflow-hidden bg-[var(--surface-2)] shrink-0">
                <img src={pendingFile.preview} alt="Preview" className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 w-full">
                <p className="text-sm font-semibold truncate text-[var(--foreground)]">{pendingFile.file.name}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {(pendingFile.file.size / 1024).toFixed(1)} KB
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={confirmUpload}
                    disabled={loading}
                    className="bg-[var(--accent)] text-white rounded-xl px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
                  >
                    {loading ? "Subiendo…" : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelFile}
                    disabled={loading}
                    className="bg-[var(--surface-2)] border border-[var(--surface-border)] text-[var(--muted-foreground)] rounded-xl px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
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
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Imágenes ({images.length})
        </h2>
        {images.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center py-8">Aún no agregaste imágenes.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative rounded-xl overflow-hidden bg-[var(--surface-2)] border border-[var(--surface-border)]">
                <div className="aspect-square">
                  <img src={img.url} alt={img.alt ?? ""} className="size-full object-cover" loading="lazy" />
                </div>
                {img.alt && (
                  <p className="px-2 py-1 text-xs truncate text-[var(--muted-foreground)]">{img.alt}</p>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="absolute top-1.5 right-1.5 size-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  {getIcon("trash", { size: 12 })}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
