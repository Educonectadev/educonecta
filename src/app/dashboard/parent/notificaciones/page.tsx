"use client"

import { useSession } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ProgressBar } from "@heroui/react"
import { NotificationList } from "@/components/animate-ui/components/community/notification-list"

type Notification = {
  id: number
  title: string
  message: string
  type: string
  createdAt: string
  isRead: boolean
}

export default function NotificationsPage() {
  const { status } = useSession()
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
    return (
      <div className="space-y-5 md:space-y-6 pt-3 md:pt-6 max-w-2xl mx-auto">
        <header>
          <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Notificaciones</p>
          <h1 className="text-lg font-semibold font-display" style={{ color: "var(--foreground)" }}>Notificaciones</h1>
        </header>
        <ProgressBar isIndeterminate aria-label="Cargando..." className="w-full">
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </div>
    )
  }

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6 max-w-2xl mx-auto">
      <header>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Notificaciones</p>
        <h1 className="text-lg font-semibold font-display" style={{ color: "var(--foreground)" }}>Notificaciones</h1>
      </header>

      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="sa-surface py-14 md:py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin notificaciones</p>
            <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No tienes notificaciones.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <NotificationList notifications={notifications} />
        </motion.div>
      )}
    </div>
  )
}
