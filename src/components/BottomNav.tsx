"use client"

import { useRouter, usePathname } from "next/navigation"
import { ToggleButton } from "@heroui/react"

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
      <div className="flex items-stretch max-w-lg mx-auto">
        {items.map((item) => {
          const segments = item.href.split("/").filter(Boolean)
          const isActive = pathname === item.href || (segments.length > 2 && pathname.startsWith(item.href + "/"))
          return (
            <ToggleButton
              key={item.href}
              isSelected={isActive}
              onPress={() => router.push(item.href)}
              variant="ghost"
              className="flex-1 flex-col gap-0.5 py-2 rounded-none h-auto min-w-0"
            >
              <span className="material-icons text-3xl">{item.icon}</span>
              <span className="text-[11px] leading-tight font-medium">{item.label}</span>
            </ToggleButton>
          )
        })}
      </div>
    </nav>
  )
}
