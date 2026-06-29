"use client"

import { memo, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export type NavItem = {
  href: string
  label: string
  icon: string
}

function BottomItem({
  item,
  active,
}: {
  item: NavItem
  active: boolean
}) {
  return (
    <Link
      href={item.href}
      prefetch
      className={
        "flex flex-col items-center justify-center px-4 py-2 rounded-[50px] transition-colors duration-150 min-w-0 " +
        (active
          ? "bg-black text-white dark:bg-white dark:text-black"
          : "text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300")
      }
    >
      <span className="material-icons text-2xl">{item.icon}</span>
      <span className="text-[10px] leading-tight mt-0.5 whitespace-nowrap">{item.label}</span>
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
    <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-[50px] shadow-lg pb-2">
      <div className="flex items-center justify-around px-2 pt-1">
        {items.map((item) => (
          <BottomItemMemo
            key={item.href}
            item={item}
            active={!!activeMap.get(item.href)}
          />
        ))}
      </div>
    </nav>
  )
}