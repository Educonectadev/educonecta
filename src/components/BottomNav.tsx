"use client"

import { memo, useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import * as Icons from "lucide-react"
import type { LucideProps } from "lucide-react"
import { useBrandColor } from "./BrandColorProvider"

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
  how_to_reg: "UserPlus",
  file_upload: "Upload",
  payments: "Banknote",
  door_open: "DoorOpen",
}

function NavIcon({ name, ...props }: { name: string } & LucideProps) {
  const key = iconMap[name]
  const Component = key ? (Icons[key] as React.ComponentType<LucideProps>) : null
  return Component ? <Component {...props} /> : null
}

function BottomItem({ item, active }: { item: NavItem; active: boolean }) {
  const { brandColor } = useBrandColor()

  return (
    <Link href={item.href} prefetch>
      <motion.div
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={
          "flex items-center gap-2 rounded-full cursor-pointer " +
          (active
            ? "bg-gray-200 dark:bg-zinc-800 pl-1.5 pr-3 py-1.5"
            : "bg-gray-100 dark:bg-zinc-900/60 w-11 h-11 justify-center")
        }
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex items-center justify-center rounded-full size-8 shrink-0"
          style={active ? { backgroundColor: brandColor } : {}}
        >
          <NavIcon
            name={item.icon}
            size={18}
            className={
              active
                ? "text-white"
                : "text-gray-400 dark:text-zinc-500"
            }
            style={
              active
                ? { color: "var(--brand-text-color, #fff)" }
                : {}
            }
          />
        </motion.div>
        {active && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-gray-900 dark:text-white text-sm font-medium whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </motion.div>
    </Link>
  )
}

const BottomItemMemo = memo(BottomItem, (prev, next) => {
  return prev.active === next.active && prev.item.href === next.item.href
})

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

export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const primaryItems = useMemo(() => items.filter((i) => !i.overflow), [items])
  const overflowItems = useMemo(() => items.filter((i) => i.overflow), [items])

  const activeMap = useMemo(() => {
    const m = new Map<string, boolean>()
    for (const item of items) {
      const segments = item.href.split("/").filter(Boolean)
      const isActive =
        pathname === item.href ||
        (segments.length > 2 && pathname.startsWith(item.href + "/"))
      m.set(item.href, isActive)
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

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden" data-tour="bottom-nav">
        <div className="flex items-center gap-1 px-3 py-2 bg-white/80 dark:bg-black/70 backdrop-blur-xl rounded-full shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-200 dark:border-zinc-800/60">
          <LayoutGroup>
            {primaryItems.map((item) => (
              <BottomItemMemo
                key={item.href}
                item={item}
                active={!!activeMap.get(item.href)}
              />
            ))}
          </LayoutGroup>

          {hasOverflow && (
            <motion.button
              data-tour="more-menu"
              onClick={() => setMoreOpen((prev) => !prev)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={
                "flex items-center justify-center size-11 rounded-full transition-colors " +
                (moreOpen
                  ? "bg-gray-200 dark:bg-zinc-700"
                  : "bg-gray-100 dark:bg-zinc-900/60")
              }
              aria-label={moreOpen ? "Cerrar menú" : "Más opciones"}
            >
              <motion.div
                animate={{ rotate: moreOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <Icons.Plus
                  size={20}
                  className="text-gray-400 dark:text-zinc-500"
                />
              </motion.div>
            </motion.button>
          )}
        </div>
      </nav>
    </>
  )
}
