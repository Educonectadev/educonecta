"use client"

import { useSession } from "@/lib/auth-context"
import { useEffect, useState } from "react"

type Notification = {
  id: number
  title: string
  message: string
  type: string
  createdAt: string
  isRead: boolean
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/parent/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [status])

  if (loading) {
    return <div className="text-sm text-gray-500">Cargando...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold text-[#1a1a1a] mb-6">Notificaciones</h1>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-400">No tienes notificaciones.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n.id} className={`p-4 rounded-xl border ${n.isRead ? "bg-white border-gray-100" : "bg-amber-50 border-amber-200"}`}>
              <p className="text-sm font-medium text-[#1a1a1a]">{n.title}</p>
              <p className="text-xs text-gray-500 mt-1">{n.message}</p>
              <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
