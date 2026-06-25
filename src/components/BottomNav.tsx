"use client"

import { useRouter, usePathname } from "next/navigation"
import { Tabs } from "@heroui/react"

export type NavItem = {
  href: string
  label: string
  icon: string
}

export default function BottomNav({ items }: { items: NavItem[] }) {
  const router = useRouter()
  const pathname = usePathname()

  const selectedKey = items.find((item) => {
    const segments = item.href.split("/").filter(Boolean)
    return pathname === item.href || (segments.length > 2 && pathname.startsWith(item.href + "/"))
  })?.href

  return (
    <Tabs
      selectedKey={selectedKey}
      onSelectionChange={(key) => router.push(key as string)}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      <Tabs.ListContainer className="w-full bg-white border-t border-gray-200 pb-safe">
        <Tabs.List aria-label="Mobile navigation" className="w-full justify-around">
          {items.map((item) => (
            <Tabs.Tab
              key={item.href}
              id={item.href}
              className="flex-1 flex-col items-center gap-1 py-2 h-auto text-gray-500 data-[selected=true]:text-gray-900"
            >
              <span className="material-icons text-2xl">{item.icon}</span>
              <span className="text-[11px] leading-tight font-medium">{item.label}</span>
              <Tabs.Indicator className="absolute top-0 h-0.5 w-8 bg-gray-900 rounded-full" />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}
