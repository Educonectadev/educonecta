"use client"

import { memo, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, LayoutGroup } from "framer-motion"
import * as Icons from "lucide-react"
import type { LucideProps } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: string
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
}

function NavIcon({ name, ...props }: { name: string } & LucideProps) {
  const key = iconMap[name]
  const Component = key ? (Icons[key] as React.ComponentType<LucideProps>) : null
  return Component ? <Component {...props} /> : null
}

function BottomItem({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} prefetch>
      <motion.div
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={
          "flex items-center gap-2 rounded-full cursor-pointer " +
          (active
            ? "bg-zinc-800 pl-1.5 pr-3 py-1.5"
            : "bg-zinc-900/60 w-11 h-11 justify-center")
        }
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={
            "flex items-center justify-center rounded-full size-8 shrink-0 " +
            (active ? "bg-[#8BFF5A]" : "")
          }
        >
          <NavIcon
            name={item.icon}
            size={18}
            className={active ? "text-black" : "text-zinc-400"}
          />
        </motion.div>
        {active && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-white text-sm font-medium whitespace-nowrap"
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

export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

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

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="flex items-center gap-1 px-3 py-2 bg-black/70 backdrop-blur-xl rounded-full shadow-2xl shadow-black/50 border border-zinc-800/60">
        <LayoutGroup>
          {items.map((item) => (
            <BottomItemMemo
              key={item.href}
              item={item}
              active={!!activeMap.get(item.href)}
            />
          ))}
        </LayoutGroup>
      </div>
    </nav>
  )
}
