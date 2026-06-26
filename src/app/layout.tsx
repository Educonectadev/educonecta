import type { Metadata } from "next"
import Provider from "@/components/Provider"
import InstallPrompt from "@/components/InstallPrompt"
import ToastProvider from "@/components/ToastProvider"
import ThemeToggle from "@/components/ThemeToggle"
import "./globals.css"

export const metadata: Metadata = {
  title: "EduConecta",
  description: "Plataforma de seguimiento escolar en tiempo real",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
  appleWebApp: { capable: true, title: "EduConecta", statusBarStyle: "black-translucent" },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased scrollbar-hide">
      <head>
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" precedence="default" />
      <meta name="theme-color" content="#000000" />
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Provider>
          <ToastProvider />
          {children}
        </Provider>
        <InstallPrompt />
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>
      </body>
    </html>
  )
}
