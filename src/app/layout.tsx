import type { Metadata } from "next"
import Provider from "@/components/Provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "EduConecta",
  description: "Plataforma de seguimiento escolar en tiempo real",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" precedence="default" />
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning><Provider>{children}</Provider></body>
    </html>
  )
}
