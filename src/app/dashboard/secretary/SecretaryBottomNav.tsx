"use client"

import BottomNav, { type NavItem } from "@/components/BottomNav"

const items: NavItem[] = [
  { href: "/dashboard/secretary", label: "Inicio", icon: "home" },
  { href: "/dashboard/secretary/alumnos", label: "Alumnos", icon: "group" },
  { href: "/dashboard/secretary/perfil", label: "Perfil", icon: "person", overflow: true },
  { href: "/dashboard/secretary/padres", label: "Padres", icon: "diversity_3", overflow: true },
  { href: "/dashboard/secretary/matricula", label: "Matrícula", icon: "how_to_reg", overflow: true },
  { href: "/dashboard/secretary/cursos", label: "Cursos", icon: "book", overflow: true },
  { href: "/dashboard/secretary/horarios", label: "Horarios", icon: "calendar_month", overflow: true },
  { href: "/dashboard/secretary/aulas", label: "Aulas", icon: "door_open", overflow: true },
  { href: "/dashboard/secretary/carga-masiva", label: "Carga masiva", icon: "file_upload", overflow: true },
  { href: "/dashboard/secretary/cuotas", label: "Cuotas", icon: "payments", overflow: true },
]

export default function SecretaryBottomNav() {
  return <BottomNav items={items} />
}
