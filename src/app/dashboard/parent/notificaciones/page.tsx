"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  readAt: string | null
  confirmedAt: string | null
  createdAt: string
  student: { firstName: string; lastName: string } | null
}

export default function NotificacionesPage() {
  const { status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/parent/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") redirect("/login")
    if (status === "authenticated") fetchNotifications()
  }, [status])

  async function markAsRead(id: number) {
    const res = await fetch("/api/parent/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "read" }),
    })
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      )
    }
  }

  async function confirmReading(id: number) {
    const res = await fetch("/api/parent/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "confirm" }),
    })
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, isRead: true, readAt: new Date().toISOString(), confirmedAt: new Date().toISOString() }
            : n
        )
      )
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Cargando notificaciones...
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
      <p className="mt-1 text-sm text-gray-500">
        Comunicaciones y alertas importantes
      </p>

      {notifications.length === 0 ? (
        <div className="mt-12 text-center text-gray-500">
          No hay notificaciones.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-[25px] border p-6 transition-all ${
                n.isRead
                  ? "border-gray-100 bg-white"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{n.title}</h3>
                    {!n.isRead && (
                      <span className="inline-block h-2 w-2 rounded-full bg-black" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                  {n.student && (
                    <p className="mt-1 text-xs text-gray-500">
                      Estudiante: {n.student.firstName} {n.student.lastName}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs">
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="rounded-[30px] border border-gray-200 px-4 py-1.5 font-medium text-gray-500 hover:bg-gray-100 hover:text-black transition-all"
                  >
                    Marcar como leída
                  </button>
                )}
                {n.type === "important" && !n.confirmedAt && (
                  <button
                    onClick={() => confirmReading(n.id)}
                    className="rounded-[30px] border border-black bg-black px-4 py-1.5 font-medium text-white hover:bg-gray-800 transition-all"
                  >
                    Confirmar lectura
                  </button>
                )}
                {n.isRead && (
                  <span className="text-gray-500">
                    Leída {n.readAt ? new Date(n.readAt).toLocaleDateString("es-ES") : ""}
                  </span>
                )}
                {n.confirmedAt && (
                  <span className="text-green-700">
                    · Confirmada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
