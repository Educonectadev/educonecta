import type { Metadata } from "next"
import Provider from "@/components/Provider"
import InstallPrompt from "@/components/InstallPrompt"
import ToastProvider from "@/components/ToastProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: "EduConecta",
  description: "Plataforma de seguimiento escolar en tiempo real",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
      <meta name="theme-color" content="#0f172a" />
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Provider>
          <ToastProvider />
          {children}
        </Provider>
        <InstallPrompt />
      </body>
    </html>
  )
}
