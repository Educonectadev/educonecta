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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {items.map((item) => {
          const segments = item.href.split("/").filter(Boolean)
          const isActive = pathname === item.href || (segments.length > 2 && pathname.startsWith(item.href + "/"))
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-[50px] transition-all duration-200 ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="material-icons text-2xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
