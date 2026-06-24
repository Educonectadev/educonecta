"use client"

import BottomNav, { type NavItem } from "@/components/BottomNav"

const items: NavItem[] = [
  { href: "/dashboard/admin", label: "Inicio", icon: "home" },
  { href: "/dashboard/admin/perfil", label: "Perfil", icon: "person" },
  { href: "/dashboard/admin/alumnos", label: "Alumnos", icon: "group" },
  { href: "/dashboard/admin/profesores", label: "Profesores", icon: "school" },
  { href: "/dashboard/admin/padres", label: "Padres", icon: "diversity_3" },
  { href: "/dashboard/admin/cursos", label: "Cursos", icon: "book" },
]

export default function AdminBottomNav() {
  return <BottomNav items={items} />
}
