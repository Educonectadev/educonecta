"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export type NavItem = {
  href: string
  label: string
  icon: string
}

export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const segments = item.href.split("/").filter(Boolean)
          const isActive = pathname === item.href || (segments.length > 2 && pathname.startsWith(item.href + "/"))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2 min-w-0 flex-1"
            >
              <span className={`material-icons text-3xl ${isActive ? "text-black" : "text-gray-500"}`}>
                {item.icon}
              </span>
              <span className={`text-[11px] leading-tight font-medium ${isActive ? "text-black font-semibold" : "text-gray-500"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
