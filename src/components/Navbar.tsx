"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { themes } from "@/lib/themes"
import ParentProfileModal from "./ParentProfileModal"

export default function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const role = session?.user?.role ?? "SUPER_ADMIN"
  const t = themes[role] ?? themes.SUPER_ADMIN

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    INSTITUTIONAL_ADMIN: "Admin",
    TEACHER: "Profesor",
    PARENT: "Padre",
  }

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-5 md:px-8 py-3 md:py-4 max-w-6xl mx-auto w-full text-[#1a1a1a]">
          <Link href="/" className="text-sm md:text-base font-semibold tracking-tight text-[#1a1a1a] hover:opacity-60 transition-opacity duration-200">
            EduConecta
          </Link>

          {session?.user && (
            <div ref={ref} className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-full px-2 py-1 md:px-3 md:py-1.5 hover:bg-gray-50 transition-all duration-200"
              >
                <span className="hidden md:block text-right text-sm leading-tight">
                  <p className="font-medium text-[#1a1a1a]">{session.user.name}</p>
                  <p className="text-[10px] text-gray-400">{roleLabel[session.user.role] ?? session.user.role}</p>
                </span>
                <span className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-white text-xs font-medium ${t.avatar}`}>
                  {initials}
                </span>
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-fade-in">
                  <div className="px-4 py-2 md:hidden border-b border-gray-50 mb-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">{session.user.name}</p>
                    <p className="text-xs text-gray-400">{roleLabel[session.user.role] ?? session.user.role}</p>
                  </div>
                  {(session.user.role === "PARENT" || session.user.role === "TEACHER" || session.user.role === "INSTITUTIONAL_ADMIN") && (
                    <button
                      onClick={() => {
                        setOpen(false)
                        const profileHref =
                          session.user.role === "PARENT" ? "/padre/perfil" :
                          session.user.role === "TEACHER" ? "/profesor/perfil" :
                          "/admin/perfil"
                        window.location.href = profileHref
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all duration-200"
                    >
                      Perfil
                    </button>
                  )}
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {showProfile && <ParentProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
