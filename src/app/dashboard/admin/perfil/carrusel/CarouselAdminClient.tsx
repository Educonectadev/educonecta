"use client"

import { useState } from "react"
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

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.danger("Solo se permiten imágenes")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.danger("La imagen no debe superar 2MB")
      return
    }
    setLoading(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      const res = await fetch("/api/admin/carousel-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: dataUrl, alt: alt.trim() || file.name }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.danger(data.error || "No se pudo subir")
        return
      }
      setImages((prev) => [...prev, data])
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

      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">Subir desde tu dispositivo</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Toca el área para elegir una foto de tu celular o computador. Máx. 2MB.</p>
        <label className="mt-4 flex flex-col items-center justify-center gap-2 cursor-pointer rounded-2xl bg-gray-50 dark:bg-zinc-800/40 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors px-6 py-10 text-center border border-dashed border-gray-300 dark:border-zinc-600">
          <svg className="size-7 text-gray-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Seleccionar imagen</span>
          <span className="text-[11px] text-gray-400 dark:text-zinc-500">JPG, PNG, WebP · 2MB máx.</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={loading}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) uploadFile(f)
              e.target.value = ""
            }}
          />
        </label>
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