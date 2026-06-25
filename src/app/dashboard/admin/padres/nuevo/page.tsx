"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Student {
  id: number
  firstName: string
  lastName: string
  documentId: string
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
}

export default function NuevoPadrePage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [institutionName, setInstitutionName] = useState("")

  useEffect(() => {
    fetch("/api/admin/institution-name").then(r => r.json()).then(d => setInstitutionName(d.name || "colegio"))
  }, [])
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
    phone: "",
    studentIds: [] as number[],
  })

  useEffect(() => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleStudent = (id: number) => {
    setForm((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter((s) => s !== id)
        : [...prev.studentIds, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/admin/parents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (res.ok) {
      router.push("/dashboard/admin/padres")
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || "Error al registrar padre")
    }
  }

  const domain = normalize(institutionName) || "colegio"
  const previewEmail = form.firstName && form.lastName
    ? `${normalize(form.firstName)}.${normalize(form.lastName)}@${domain}.edu.pe`
    : ""

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Registrar Padre</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">Nombres</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
              placeholder="Juan"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">Apellidos</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
              placeholder="Pérez"
            />
          </div>
        </div>

        {previewEmail && (
          <div className="bg-gray-50 rounded-[20px] px-5 py-3">
            <p className="text-xs text-gray-400">Email generado automáticamente:</p>
            <p className="text-sm font-medium text-gray-700">{previewEmail}</p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-500">Contraseña</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
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
          <label className="mb-1.5 block text-sm font-medium text-gray-500">Hijos</label>
          <div className="max-h-48 overflow-y-auto scrollbar-hide rounded-[30px] border border-gray-200 p-3">
            {students.length === 0 ? (
              <p className="p-2 text-sm text-gray-400">No hay alumnos disponibles.</p>
            ) : (
              students.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-2 rounded-[30px] px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.studentIds.includes(s.id)}
                    onChange={() => toggleStudent(s.id)}
                  />
                  {s.firstName} {s.lastName} ({s.documentId})
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !form.firstName || !form.lastName || !form.password}
            className="rounded-[30px] bg-black px-8 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <Link
            href="/dashboard/admin/padres"
            className="rounded-[30px] border border-gray-200 px-7 py-3 text-sm font-medium text-gray-400 transition-all hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
