"use client"

import Link from "next/link"
import { useState } from "react"
import { Avatar, Dropdown, Label } from "@heroui/react"
import { ArrowRightFromSquare, Gear, Persons } from "@gravity-ui/icons"
import { useSession } from "@/lib/auth-context"
import { themes } from "@/lib/themes"
import ThemeToggle from "./ThemeToggle"
import ParentProfileModal from "./ParentProfileModal"

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

  const showProfileItem =
    session?.user?.role === "PARENT" ||
    session?.user?.role === "TEACHER" ||
    session?.user?.role === "INSTITUTIONAL_ADMIN"

  const profileHref =
    session?.user?.role === "PARENT" ? "/padre/perfil" :
    session?.user?.role === "TEACHER" ? "/profesor/perfil" :
    "/admin/perfil"

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between px-5 md:px-8 py-3 md:py-4 max-w-6xl mx-auto w-full text-gray-900 dark:text-white/90">
          <Link href="/" className="text-sm md:text-base font-semibold tracking-tight text-gray-900 dark:text-white/90 hover:opacity-60 transition-opacity duration-200">
            EduConecta
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session?.user && (
              <Dropdown>
                <Dropdown.Trigger className="rounded-full">
                  <button className="flex items-center gap-2 rounded-full px-2 py-1 md:px-3 md:py-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200">
                    <span className="hidden md:block text-right text-sm leading-tight">
                      <p className="font-medium text-gray-900 dark:text-white/90">{session.user.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500">{roleLabel[session.user.role] ?? session.user.role}</p>
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
                <Dropdown.Popover>
                  <div className="px-3 pt-3 pb-1">
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
                        <p className="text-sm leading-5 font-medium text-gray-900 dark:text-white/90">{session.user.name}</p>
                        <p className="text-xs leading-none text-gray-400 dark:text-zinc-500">{roleLabel[session.user.role] ?? session.user.role}</p>
                      </div>
                    </div>
                  </div>
                  <Dropdown.Menu>
                    {showProfileItem && (
                      <Dropdown.Item
                        id="profile"
                        textValue="Perfil"
                        onAction={() => { window.location.href = profileHref }}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <Label>Perfil</Label>
                          <Gear className="size-3.5 text-muted" />
                        </div>
                      </Dropdown.Item>
                    )}
                    {showProfileItem && (
                      <Dropdown.Item id="settings" textValue="Configuración">
                        <div className="flex w-full items-center justify-between gap-2">
                          <Label>Configuración</Label>
                          <Persons className="size-3.5 text-muted" />
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
                        <ArrowRightFromSquare className="size-3.5 text-danger" />
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
