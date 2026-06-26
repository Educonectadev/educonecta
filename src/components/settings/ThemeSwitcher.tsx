"use client"

import { useTheme } from "@/components/ThemeProvider"

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const options: { value: "light" | "dark"; label: string; icon: string }[] = [
    { value: "light", label: "Claro", icon: "☀️" },
    { value: "dark", label: "Oscuro", icon: "🌙" },
  ]

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
        Tema
      </p>
      <p className="text-[11px] text-gray-400 dark:text-zinc-500 -mt-1">
        Cambia entre modo claro y oscuro
      </p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`flex-1 rounded-[20px] border px-4 py-3 text-sm font-medium transition-all duration-200 ${
              theme === opt.value
                ? "border-transparent bg-[var(--brand-color)] text-[var(--brand-text-color)]"
                : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="mr-2">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}