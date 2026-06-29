"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import * as Icons from "lucide-react"
import type { LucideProps } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: string
  overflow?: boolean
}

const iconMap: Record<string, keyof typeof Icons> = {
  home: "Home",
  assignment: "ClipboardList",
  grade: "Star",
  mail: "Mail",
  dashboard: "LayoutDashboard",
  menu_book: "BookOpen",
  fact_check: "ClipboardCheck",
  person: "User",
  account_balance: "Landmark",
  groups: "Users",
  card_membership: "CreditCard",
  history: "History",
  calendar_month: "Calendar",
  qr_code_scanner: "QrCode",
  gavel: "Gavel",
  chat: "MessageCircle",
  group: "Users",
  school: "GraduationCap",
  diversity_3: "UserPlus",
  book: "Book",
  notifications: "Bell",
  settings: "Settings",
  door_open: "DoorOpen",
}

function NavIcon({ name, ...props }: { name: string } & LucideProps) {
  const key = iconMap[name]
  const Component = key ? (Icons[key] as React.ComponentType<LucideProps>) : null
  return Component ? <Component {...props} /> : null
}

function MoreMenu({ items, onClose }: { items: NavItem[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 40 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      style={{ originX: 0.5, originY: 1 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 md:hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-gray-300/30 dark:shadow-black/50 border border-gray-200 dark:border-zinc-800/60 min-w-[200px]">
        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          {items.map((item) => (
            <motion.div
              key={item.href}
              variants={{
                hidden: { opacity: 0, scale: 0.3 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { type: "spring", damping: 18, stiffness: 260 },
                },
              }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="size-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                  <NavIcon name={item.icon} size={20} className="text-gray-500 dark:text-zinc-400" />
                </div>
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

function TabItem({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} prefetch className="block">
      <div className="relative flex flex-col items-center px-2.5 py-1.5 min-w-[44px] cursor-pointer">
        {active && (
          <motion.div
            layoutId="active-bg"
            layout
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute inset-0 bg-white rounded-full"
          />
        )}
        <div className="relative z-10 flex items-center justify-center size-5 mb-0.5">
          <NavIcon
            name={item.icon}
            size={16}
            className={active ? "text-black" : "text-zinc-400"}
          />
        </div>
        <span
          className={
            "relative z-10 text-[10px] leading-tight whitespace-nowrap " +
            (active ? "text-black font-medium" : "text-zinc-500")
          }
        >
          {item.label}
        </span>
      </div>
    </Link>
  )
}

export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const primaryItems = useMemo(() => items.filter((i) => !i.overflow), [items])
  const overflowItems = useMemo(() => items.filter((i) => i.overflow), [items])

  const isActive = useMemo(() => {
    const m = new Map<string, boolean>()
    for (const item of items) {
      const segments = item.href.split("/").filter(Boolean)
      const active =
        pathname === item.href ||
        (segments.length > 2 && pathname.startsWith(item.href + "/"))
      m.set(item.href, active)
    }
    return m
  }, [items, pathname])

  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  const hasOverflow = overflowItems.length > 0

  return (
    <>
      {hasOverflow && (
        <AnimatePresence>
          {moreOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden bg-black/20 dark:bg-black/40"
              onClick={() => setMoreOpen(false)}
            />
          )}
        </AnimatePresence>
      )}

      {hasOverflow && (
        <AnimatePresence>
          {moreOpen && <MoreMenu items={overflowItems} onClose={() => setMoreOpen(false)} />}
        </AnimatePresence>
      )}

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className="flex items-center gap-0.5 px-1.5 py-1.5 bg-black/80 backdrop-blur-xl rounded-full shadow-2xl shadow-black/50 border border-zinc-800/60">
          <LayoutGroup>
            {primaryItems.map((item) => (
              <TabItem
                key={item.href}
                item={item}
                active={!!isActive.get(item.href)}
              />
            ))}

            {hasOverflow && (
              <button
                onClick={() => setMoreOpen((prev) => !prev)}
                className="relative flex flex-col items-center px-2.5 py-1.5 min-w-[44px] cursor-pointer"
              >
                <div className="relative z-10 flex items-center justify-center size-5 mb-0.5">
                  <motion.div
                    animate={{ rotate: moreOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <Icons.Plus
                      size={16}
                      className={moreOpen ? "text-white" : "text-zinc-400"}
                    />
                  </motion.div>
                </div>
                <span
                  className={
                    "relative z-10 text-[10px] leading-tight whitespace-nowrap " +
                    (moreOpen ? "text-white" : "text-zinc-500")
                  }
                >
                  Más
                </span>
              </button>
            )}
          </LayoutGroup>
        </div>
      </nav>
    </>
  )
}
