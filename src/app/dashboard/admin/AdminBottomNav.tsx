"use client"

import BottomNav, { type NavItem } from "@/components/BottomNav"

const items: NavItem[] = [
  { href: "/dashboard/admin", label: "Inicio", icon: "home" },
  { href: "/dashboard/admin/perfil", label: "Perfil", icon: "person" },
  { href: "/dashboard/admin/configuracion", label: "Configuración", icon: "settings", overflow: true },
  { href: "/dashboard/admin/configuracion/evaluacion", label: "Evaluación", icon: "fact_check", overflow: true },
  { href: "/dashboard/admin/configuracion/periodos", label: "Períodos", icon: "calendar_month", overflow: true },
]

export default function AdminBottomNav() {
  return <BottomNav items={items} />
}
