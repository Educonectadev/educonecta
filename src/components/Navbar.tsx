"use client"

import Link from "next/link"
import { useState } from "react"
import { Avatar, Dropdown, Label } from "@heroui/react"
import { ArrowRightFromSquare, Gear, Sliders } from "@gravity-ui/icons"
import { useSession } from "@/lib/auth-context"
import { themes } from "@/lib/themes"
import ThemeToggle from "./ThemeToggle"
import ParentProfileModal from "./ParentProfileModal"
import Logo from "./Logo"

export default function Navbar() {
  const { data: session, signOut } = useSession()
  const [showProfile, setShowProfile] = useState(false)
  const role = session?.user?.role ?? "SUPER_ADMIN"
  const t = themes[role] ?? themes.SUPER_ADMIN

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    INSTITUTIONAL_ADMIN: "Admin",
    TEACHER: "Profesor",
    PARENT: "Padre",
  }

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  const roleHasProfile = !!session?.user && ["PARENT", "TEACHER", "INSTITUTIONAL_ADMIN"].includes(session.user.role)

  const profileHref =
    session?.user?.role === "PARENT" ? "/dashboard/parent/perfil" :
    session?.user?.role === "TEACHER" ? "/dashboard/teacher/perfil" :
    "/dashboard/admin/perfil"

  const configHref =
    session?.user?.role === "PARENT" ? "/dashboard/parent/configuracion" :
    session?.user?.role === "TEACHER" ? "/dashboard/teacher/configuracion" :
    session?.user?.role === "INSTITUTIONAL_ADMIN" ? "/dashboard/admin/configuracion" :
    "/dashboard/super-admin/configuracion"

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between px-3 sm:px-5 md:px-8 py-3 md:py-4 max-w-6xl mx-auto w-full">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <Logo size={28} className="shrink-0 group-hover:opacity-60 transition-opacity duration-200" />
            <span className="text-sm md:text-base font-semibold tracking-tight text-black dark:text-white group-hover:opacity-60 transition-opacity duration-200">
              EduConecta
            </span>
          </Link>

          <div className="flex items-center gap-2 text-black dark:text-white">
            <div data-tour="theme-toggle"><ThemeToggle /></div>
            {session?.user && (
              <Dropdown>
                <Dropdown.Trigger className="rounded-full outline-none">
                  <button className="flex items-center gap-2 rounded-full px-2 py-1 md:px-3 md:py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200" data-tour="user-menu">
                    <span className="user-name hidden md:flex md:flex-col md:items-end md:leading-tight">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{session.user.name}</span>
                      <span className="text-[10px] text-gray-500 dark:text-zinc-400">{roleLabel[session.user.role] ?? session.user.role}</span>
                    </span>
                    <Avatar size="sm">
                      <Avatar.Fallback
                        className={`text-white font-medium ${t.avatar}`}
                        delayMs={600}
                      >
                        {initials}
                      </Avatar.Fallback>
                    </Avatar>
                  </button>
                </Dropdown.Trigger>
                <Dropdown.Popover className="user-dropdown min-w-[240px]">
                  <div className="px-3 pt-3 pb-1 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        <Avatar.Fallback
                          className={`text-white font-medium ${t.avatar}`}
                          delayMs={600}
                        >
                          {initials}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="flex flex-col gap-0">
                        <p className="text-sm leading-5 font-medium text-gray-900 dark:text-white">{session.user.name}</p>
                        <p className="text-xs leading-none text-gray-500 dark:text-zinc-400">{roleLabel[session.user.role] ?? session.user.role}</p>
                      </div>
                    </div>
                  </div>
                  <Dropdown.Menu>
                    {roleHasProfile && (
                      <Dropdown.Item
                        id="profile"
                        textValue="Perfil"
                        onAction={() => { window.location.href = profileHref }}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <Label>Perfil</Label>
                          <Gear className="size-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      </Dropdown.Item>
                    )}
                    {roleHasProfile && (
                      <Dropdown.Item
                        id="settings"
                        textValue="Configuración"
                        onAction={() => { window.location.href = configHref }}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <Label>Configuración</Label>
                          <Sliders className="size-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item
                      id="logout"
                      textValue="Cerrar Sesión"
                      variant="danger"
                      onAction={() => { signOut() }}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <Label>Cerrar Sesión</Label>
                        <ArrowRightFromSquare className="size-4" />
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            )}
          </div>
        </div>
      </nav>

      {showProfile && <ParentProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
