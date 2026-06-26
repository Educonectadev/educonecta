"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Registrar Alumno</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-500">Nombre</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-500">Apellido</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-500">Documento de Identidad</label>
          <input
            name="documentId"
            value={form.documentId}
            onChange={handleChange}
            required
            className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-500">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-500">Teléfono</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-500">Grado</label>
          <Select value={form.gradeId} onChange={(val) => setForm((prev) => ({...prev, gradeId: val}))} options={grades.map(g => ({value: String(g.id), label: g.name}))} placeholder="Seleccionar grado" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-500">Sección</label>
          <Select value={form.sectionId} onChange={(val) => setForm((prev) => ({...prev, sectionId: val}))} options={sections.map(s => ({value: String(s.id), label: s.name}))} placeholder="Seleccionar sección" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-[30px] bg-black dark:bg-white px-8 py-3 text-sm font-medium text-white dark:text-black transition-all hover:bg-gray-800 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <Link
            href="/dashboard/admin/alumnos"
            className="rounded-[30px] border border-gray-200 px-7 py-3 text-sm font-medium text-gray-400 transition-all hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
