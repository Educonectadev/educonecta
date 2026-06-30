'use client';

import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, type Transition } from 'motion/react';

interface Notification {
  id: number
  title: string
  message: string
  createdAt: string
  isRead: boolean
}

interface NotificationListProps {
  notifications: Notification[]
}

const transition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 26,
};

const getCardVariants = (i: number) => ({
  collapsed: {
    marginTop: i === 0 ? 0 : -44,
    scaleX: 1 - i * 0.05,
  },
  expanded: {
    marginTop: i === 0 ? 0 : 4,
    scaleX: 1,
  },
});

const textSwitchTransition: Transition = {
  duration: 0.22,
  ease: 'easeInOut',
};

const notificationTextVariants = {
  collapsed: { opacity: 1, y: 0, pointerEvents: 'auto' },
  expanded: { opacity: 0, y: -16, pointerEvents: 'none' },
};

const viewAllTextVariants = {
  collapsed: { opacity: 0, y: 16, pointerEvents: 'none' },
  expanded: { opacity: 1, y: 0, pointerEvents: 'auto' },
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'justo ahora'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}

function NotificationList({ notifications }: NotificationListProps) {
  return (
    <motion.div
      className="bg-neutral-200 dark:bg-neutral-900 p-3 rounded-3xl w-full space-y-3 shadow-md"
      initial="collapsed"
      whileHover="expanded"
    >
      <div>
        {notifications.map((notification, i) => (
          <motion.div
            key={notification.id}
            className={`bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-2 shadow-sm hover:shadow-lg transition-shadow duration-200 relative${!notification.isRead ? ' border-l-4 border-amber-500 dark:border-amber-400' : ''}`}
            variants={getCardVariants(i)}
            transition={transition}
            style={{
              zIndex: notifications.length - i,
            }}
          >
            <div className="flex justify-between items-center">
              <h1 className="text-sm font-medium">{notification.title}</h1>
            </div>
            <div className="text-xs text-neutral-500 font-medium">
              <span>{formatRelativeTime(notification.createdAt)}</span>
              &nbsp;•&nbsp;
              <span>{notification.message}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="size-5 rounded-full bg-neutral-400 text-white text-xs flex items-center justify-center font-medium">
          {notifications.length}
        </div>
        <span className="grid">
          <motion.span
            className="text-sm font-medium text-neutral-600 dark:text-neutral-300 row-start-1 col-start-1"
            variants={notificationTextVariants}
            transition={textSwitchTransition}
          >
            Notificaciones
          </motion.span>
          <motion.span
            className="text-sm font-medium text-neutral-600 dark:text-neutral-300 flex items-center gap-1 cursor-pointer select-none row-start-1 col-start-1"
            variants={viewAllTextVariants}
            transition={textSwitchTransition}
          >
            View all <ArrowUpRight className="size-4" />
          </motion.span>
        </span>
      </div>
    </motion.div>
  );
}

export { NotificationList };
