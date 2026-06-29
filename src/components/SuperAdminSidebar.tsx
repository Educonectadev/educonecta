"use client"

import { memo, useMemo, useEffect, useCallback, useRef, useState, useLayoutEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { getIcon } from "./premium/IconTile"
import { themes, type RoleTheme } from "@/lib/themes"

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
  const icon = getIcon(link.icon, { size: 16, strokeWidth: 2 })

  return (
    <Link
      href={link.href}
      prefetch
      onMouseEnter={prefetch}
      data-active={active}
      className="sa-rail-item group"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="sa-rail-icon"
      >
        {icon}
      </motion.span>
      <AnimatePresence initial={false} mode="wait">
        {active && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }}
            className="flex-1 truncate text-[13px] font-semibold"
          >
            {link.label}
          </motion.span>
        )}
      </AnimatePresence>
      {link.extra && (
        <span className="ml-auto transition-opacity group-hover:opacity-100">
          {link.extra}
        </span>
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
  const railRef = useRef<HTMLDivElement>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

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
    <aside className="hidden md:block w-[252px] shrink-0 p-4" data-tour="sidebar">
      <div ref={railRef} className="sa-rail h-full flex flex-col sticky top-20">
        <div className="px-3 pt-2 pb-4">
          <p className="sa-eyebrow">{label}</p>
        </div>
        <nav aria-label={label} className="flex flex-col gap-0.5">
          {links.map((link, idx) => (
            <div
              key={link.href}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <NavItem link={link} active={!!activeMap.get(link.href)} />
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <div className="sa-surface-flat p-3 text-[11px] leading-snug text-[color:var(--muted-foreground)]">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--neon)", boxShadow: "0 0 8px var(--neon-glow)" }}
              />
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                Sistema operativo
              </span>
            </div>
            Plataforma EduConecta en línea. Las métricas se actualizan en tiempo real.
          </div>
        </div>
      </div>
    </aside>
  )
}