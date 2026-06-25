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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 pb-safe">
      <Tabs selectedKey={selectedKey} onSelectionChange={(key) => router.push(key as string)} className="w-full max-w-lg mx-auto">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Mobile navigation">
            {items.map((item) => (
              <Tabs.Tab
                key={item.href}
                id={item.href}
                className="flex-1 py-2 text-gray-400 data-[selected=true]:text-gray-900"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="material-icons text-3xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <Tabs.Indicator className="bg-gray-900 h-0.5 top-0 rounded-full" />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {items.map((item) => (
          <Tabs.Panel key={item.href} id={item.href} className="hidden"> </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  )
}
