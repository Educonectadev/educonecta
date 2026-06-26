"use client"

import { AuthProvider } from "@/lib/auth-context"
import ThemeProvider from "./ThemeProvider"
import BrandColorProvider from "./BrandColorProvider"

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <BrandColorProvider>
        <AuthProvider>{children}</AuthProvider>
      </BrandColorProvider>
    </ThemeProvider>
  )
}
