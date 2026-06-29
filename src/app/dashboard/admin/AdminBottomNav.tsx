"use client"

import BottomNav, { type NavItem } from "@/components/BottomNav"

const items: NavItem[] = [
  { href: "/dashboard/admin", label: "Inicio", icon: "home" },
  { href: "/dashboard/admin/alumnos", label: "Alumnos", icon: "group" },
  { href: "/dashboard/admin/profesores", label: "Profesores", icon: "school" },
  { href: "/dashboard/admin/perfil", label: "Perfil", icon: "person", overflow: true },
  { href: "/dashboard/admin/padres", label: "Padres", icon: "diversity_3", overflow: true },
  { href: "/dashboard/admin/cursos", label: "Cursos", icon: "book", overflow: true },
  { href: "/dashboard/admin/horarios", label: "Horarios", icon: "calendar_month", overflow: true },
  { href: "/dashboard/admin/aulas", label: "Aulas", icon: "door_open", overflow: true },
  { href: "/dashboard/admin/configuracion", label: "Configuración", icon: "settings", overflow: true },
]

export default function AdminBottomNav() {
  return <BottomNav items={items} />
}
