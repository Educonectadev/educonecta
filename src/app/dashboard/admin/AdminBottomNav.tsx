"use client"

import BottomNav, { type NavItem } from "@/components/BottomNav"

const items: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: "home" },
  { href: "/admin/perfil", label: "Perfil", icon: "person" },
  { href: "/admin/alumnos", label: "Alumnos", icon: "group" },
  { href: "/admin/profesores", label: "Profesores", icon: "school" },
  { href: "/admin/padres", label: "Padres", icon: "diversity_3" },
  { href: "/admin/cursos", label: "Cursos", icon: "book" },
  { href: "/admin/grados", label: "Grados", icon: "layers" },
  { href: "/admin/horarios", label: "Horarios", icon: "calendar_month" },
  { href: "/admin/aulas", label: "Aulas", icon: "meeting_room" },
]

export default function AdminBottomNav() {
  return <BottomNav items={items} />
}
