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
    return <div className="text-sm text-gray-500 dark:text-zinc-400">Cargando...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-6">Notificaciones</h1>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-zinc-500">No tienes notificaciones.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n.id} className={`p-4 rounded-xl border ${n.isRead ? "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800" : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"}`}>
              <p className="text-sm font-medium text-gray-900 dark:text-white/90">{n.title}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{n.message}</p>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
