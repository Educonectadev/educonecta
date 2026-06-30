"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "@heroui/react"
import Select from "@/components/Select"

interface Grade {
  id: number
  name: string
}

interface Section {
  id: number
  name: string
}

export default function NuevoAlumnoPage() {
  const router = useRouter()
  const [grades, setGrades] = useState<Grade[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentId: "",
    email: "",
    phone: "",
    gradeId: "",
    sectionId: "",
  })

  useEffect(() => {
    fetch("/api/admin/grades")
      .then((r) => r.json())
      .then(setGrades)
  }, [])

  useEffect(() => {
    const promise = form.gradeId
      ? fetch(`/api/admin/sections?gradeId=${form.gradeId}`).then((r) => r.json())
      : Promise.resolve<Section[]>([])
    promise.then(setSections)
  }, [form.gradeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const body = {
      ...form,
      gradeId: form.gradeId ? Number(form.gradeId) : null,
      sectionId: form.sectionId ? Number(form.sectionId) : null,
    }

    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)

    if (res.ok) {
      router.push("/dashboard/admin/alumnos")
      router.refresh()
    } else {
      const data = await res.json()
      toast.danger(data.error || "Error al registrar alumno")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
      <div className="mb-8">
        <p className="sa-eyebrow">Gestión académica</p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Registrar Alumno</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div>
          <label className="block sa-eyebrow mb-1.5">Nombre</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            className="sa-input w-full"
          />
        </div>

        <div>
          <label className="block sa-eyebrow mb-1.5">Apellido</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            className="sa-input w-full"
          />
        </div>

        <div>
          <label className="block sa-eyebrow mb-1.5">Documento de Identidad</label>
          <input
            name="documentId"
            value={form.documentId}
            onChange={handleChange}
            required
            className="sa-input w-full"
          />
        </div>

        <div>
          <label className="block sa-eyebrow mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="sa-input w-full"
          />
        </div>

        <div>
          <label className="block sa-eyebrow mb-1.5">Teléfono</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="sa-input w-full"
          />
        </div>

        <div>
          <label className="block sa-eyebrow mb-1.5">Grado</label>
          <Select value={form.gradeId} onChange={(val) => setForm((prev) => ({...prev, gradeId: val}))} options={grades.map(g => ({value: String(g.id), label: g.name}))} placeholder="Seleccionar grado" />
        </div>

        <div>
          <label className="block sa-eyebrow mb-1.5">Sección</label>
          <Select value={form.sectionId} onChange={(val) => setForm((prev) => ({...prev, sectionId: val}))} options={sections.map(s => ({value: String(s.id), label: s.name}))} placeholder="Seleccionar sección" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="sa-btn sa-btn-primary"
          >
            {loading ? "Guardando..." : "Guardar"}
          </motion.button>
          <Link
            href="/dashboard/admin/alumnos"
            className="sa-btn sa-btn-ghost"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </motion.div>
  )
}
