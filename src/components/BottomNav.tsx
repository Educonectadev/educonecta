"use client"

import { useRouter, usePathname } from "next/navigation"

export type NavItem = {
  href: string
  label: string
  icon: string
}

export default function BottomNav({ items }: { items: NavItem[] }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-[50px] shadow-lg pb-2">
      <div className="flex items-center justify-around px-2 pt-1">
        {items.map((item) => {
          const segments = item.href.split("/").filter(Boolean)
          const isActive = pathname === item.href || (segments.length > 2 && pathname.startsWith(item.href + "/"))
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-[50px] transition-all duration-200 min-w-0 ${
                isActive
                  ? "text-white"
                  : "text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
              }`}
              style={isActive ? { backgroundColor: "var(--brand-color)" } : undefined}
            >
              <span className="material-icons text-2xl">{item.icon}</span>
              <span className="text-[10px] leading-tight mt-0.5 whitespace-nowrap">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
