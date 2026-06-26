"use client"

import { Icon } from "@iconify/react"

export default function IconClient({ icon, className }: { icon: string; className?: string }) {
  return <Icon icon={icon} className={className} />
}
