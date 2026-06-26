"use client"

import { AuthProvider } from "@/lib/auth-context"
import ThemeProvider from "./ThemeProvider"

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
