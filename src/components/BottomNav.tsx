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
    <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden bg-white border border-gray-200 rounded-[50px] shadow-lg pb-2">
      <div className="flex items-center justify-around px-2 pt-1">
        {items.map((item) => {
          const segments = item.href.split("/").filter(Boolean)
          const isActive = pathname === item.href || (segments.length > 2 && pathname.startsWith(item.href + "/"))
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex items-center justify-center px-5 py-3 rounded-[50px] transition-all duration-200 ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="material-icons text-2xl">{item.icon}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
