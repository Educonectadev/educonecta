"use client"

import { useEffect, useState } from "react"
import { Modal } from "@heroui/react"

interface ProfileData {
  user: { id: number; email: string; name: string; role: string; createdAt: string } | null
  children: ChildData[]
  passingGrade: number
}

interface ChildData {
  id: number
  firstName: string
  lastName: string
  documentId: string
  email: string | null
  phone: string | null
  isActive: boolean
  grade: { id: number; name: string; level: string } | null
  section: { id: number; name: string } | null
  grades: { courseName: string; average: number; evaluations: number }[]
  totalEvaluations: number
  overallAverage: number | null
  passes: boolean | null
}

export default function ParentProfileModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/parent/profile")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setError("Error al cargar perfil"); setLoading(false) })
  }, [])

  return (
    <Modal isOpen onOpenChange={(v) => { if (!v) onClose() }}>
      <Modal.Backdrop />
      <Modal.Container size="full" scroll="outside">
        <Modal.Dialog className="z-[60]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Mi Perfil</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {loading && <p className="text-center text-gray-400 py-8">Cargando...</p>}
            {error && <p className="text-center text-red-500 py-8">{error}</p>}

            {data && (
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">Datos del Padre</h3>
                  <div className="bg-amber-50 rounded-[20px] p-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Nombre</p>
                      <p className="font-medium">{data.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="font-medium">{data.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Rol</p>
                      <p className="font-medium">Padre de Familia</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Registrado desde</p>
                      <p className="font-medium">{data.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString("es-PE") : "—"}</p>
                    </div>
                  </div>
                </section>

                {data.children.map((child) => {
                  const passText = child.passes === null ? "Sin notas" : child.passes ? "Sí pasa" : "No pasa"
                  const passColor = child.passes === null ? "text-gray-400" : child.passes ? "text-green-600" : "text-red-500"
                  return (
                    <section key={child.id}>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                        {child.firstName} {child.lastName}
                      </h3>
                      <div className="bg-gray-50 rounded-[20px] p-5 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">Documento</p>
                            <p className="font-medium">{child.documentId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Grado</p>
                            <p className="font-medium">{child.grade?.name ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Sección</p>
                            <p className="font-medium">{child.section?.name ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Nivel</p>
                            <p className="font-medium">{child.grade?.level ?? "—"}</p>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Rendimiento Académico</p>
                            <span className={`text-sm font-bold ${passColor}`}>{passText}</span>
                          </div>

                          {child.grades.length === 0 ? (
                            <p className="text-sm text-gray-400">Sin notas registradas</p>
                          ) : (
                            <div className="space-y-2">
                              {child.grades.map((g) => {
                                const avgColor = g.average >= data.passingGrade ? "text-green-600" : "text-red-500"
                                return (
                                  <div key={g.courseName} className="flex items-center justify-between text-sm bg-white rounded-[15px] px-4 py-2.5 border border-gray-100">
                                    <div>
                                      <p className="font-medium">{g.courseName}</p>
                                      <p className="text-xs text-gray-400">{g.evaluations} evaluación(es)</p>
                                    </div>
                                    <span className={`font-bold ${avgColor}`}>{g.average.toFixed(1)}</span>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {child.overallAverage !== null && (
                            <div className="mt-3 flex items-center justify-between bg-gray-100 rounded-[15px] px-4 py-3">
                              <p className="text-sm font-semibold">Promedio General</p>
                              <span className={`font-bold text-base ${child.passes ? "text-green-600" : "text-red-500"}`}>
                                {child.overallAverage.toFixed(1)}
                                <span className="text-xs ml-1">/ {data.passingGrade} mínimo</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {child.email && (
                          <div className="border-t border-gray-200 pt-3 text-xs text-gray-400">
                            Contacto: {child.email}{child.phone ? ` · ${child.phone}` : ""}
                          </div>
                        )}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}
