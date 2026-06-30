"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "@heroui/react"

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
      toast.danger(data.error || "Error al registrar padre")
    }
  }

  const domain = normalize(institutionName) || "colegio"
  const previewEmail = form.firstName && form.lastName
    ? `${normalize(form.firstName)}.${normalize(form.lastName)}@${domain}.edu.pe`
    : ""

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
      <div className="mb-8">
        <p className="sa-eyebrow">Comunidad educativa</p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Registrar Padre</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block sa-eyebrow mb-1.5">Nombres</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="sa-input w-full"
              placeholder="Juan"
            />
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Apellidos</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="sa-input w-full"
              placeholder="Pérez"
            />
          </div>
        </div>

        {previewEmail && (
          <div className="px-5 py-3 rounded-[var(--radius-tile)]" style={{ background: "var(--surface-2)" }}>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Email generado automáticamente:</p>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{previewEmail}</p>
          </div>
        )}

        <div>
          <label className="block sa-eyebrow mb-1.5">Contraseña</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
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
          <label className="block sa-eyebrow mb-1.5">Hijos</label>
          <div className="max-h-48 overflow-y-auto scrollbar-hide sa-surface p-3" style={{ borderRadius: "var(--radius-tile)" }}>
            {students.length === 0 ? (
              <p className="p-2 text-sm" style={{ color: "var(--muted-foreground)" }}>No hay alumnos disponibles.</p>
            ) : (
              students.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-pill)] transition-colors"
                  style={{ color: "var(--foreground)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
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
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !form.firstName || !form.lastName || !form.password}
            className="sa-btn sa-btn-primary"
          >
            {loading ? "Guardando..." : "Guardar"}
          </motion.button>
          <Link
            href="/dashboard/admin/padres"
            className="sa-btn sa-btn-ghost"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </motion.div>
  )
}
