"use client"

import { memo, useMemo, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { getIcon } from "./premium/iconRegistry"

interface NavLink {
  href: string
  label: string
  icon: string
  extra?: React.ReactNode
}

const NavItem = memo(function NavItem({
  link,
  active,
}: {
  link: NavLink
  active: boolean
}) {
  const router = useRouter()
  const prefetch = useCallback(() => router.prefetch(link.href), [router, link.href])
  const icon = getIcon(link.icon, { size: 18, strokeWidth: 2 })

  return (
    <Link
      href={link.href}
      prefetch
      onMouseEnter={prefetch}
      data-active={active}
      className="sa-rail-item group"
    >
      <span className="sa-rail-icon shrink-0">{icon}</span>
      <span className="sa-rail-label">{link.label}</span>
      {link.extra && (
        <span className="ml-auto shrink-0 transition-opacity">{link.extra}</span>
      )}
    </Link>
  )
})

export default function SuperAdminSidebar({
  links,
  label,
}: {
  links: NavLink[]
  label: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    links.forEach((link) => router.prefetch(link.href))
  }, [links, router])

  const activeMap = useMemo(() => {
    const m = new Map<string, boolean>()
    for (const link of links) {
      const segments = link.href.split("/").filter(Boolean)
      const active =
        pathname === link.href ||
        (segments.length > 2 && pathname.startsWith(link.href + "/"))
      m.set(link.href, active)
    }
    return m
  }, [links, pathname])

  return (
    <aside className="sa-sidebar" data-tour="sidebar">
      <div className="sa-sidebar-rail">
        <div className="px-3 pt-2 pb-4">
          <p className="sa-eyebrow">{label}</p>
        </div>
        <nav aria-label={label} className="flex flex-col gap-0.5">
          {links.map((link) => (
            <NavItem key={link.href} link={link} active={!!activeMap.get(link.href)} />
          ))}
        </nav>

        <div className="sa-sidebar-footer">
          <div className="sa-surface-flat sa-sidebar-status">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: "var(--neon)",
                  boxShadow: "0 0 8px var(--neon-glow)",
                }}
              />
              <span
                className="font-semibold sa-sidebar-status-title"
                style={{ color: "var(--foreground)" }}
              >
                Sistema operativo
              </span>
            </div>
            <p className="sa-sidebar-status-text">
              Plataforma EduConecta en línea. Las métricas se actualizan en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}