"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { Session, UserSession } from "./session"

type AuthState = {
  data: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
}

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  data: null,
  status: "loading",
  signIn: async () => ({}),
  signOut: async () => {},
})

function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ data: null, status: "loading" })

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session")
      if (res.ok) {
        const session = await res.json()
        if (session?.user) {
          setState({ data: session, status: "authenticated" })
          return
        }
      }
      setState({ data: null, status: "unauthenticated" })
    } catch {
      setState({ data: null, status: "unauthenticated" })
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const signIn = async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    await fetchSession()
    return {}
  }

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    setState({ data: null, status: "unauthenticated" })
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSession() {
  return useContext(AuthContext)
}
