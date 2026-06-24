export interface RoleTheme {
  sidebar: {
    activeBg: string
    activeText: string
    hoverBg: string
    hoverText: string
    labelColor: string
  }
  card: {
    bg: string
    border: string
    hoverBg: string
  }
  avatar: string
  accent: string
}

export const themes: Record<string, RoleTheme> = {
  SUPER_ADMIN: {
    sidebar: {
      activeBg: "bg-black",
      activeText: "text-white",
      hoverBg: "hover:bg-black",
      hoverText: "hover:text-white",
      labelColor: "text-black/40",
    },
    card: {
      bg: "bg-white",
      border: "border-black/10",
      hoverBg: "hover:bg-black/5",
    },
    avatar: "bg-black",
    accent: "text-black",
  },
  INSTITUTIONAL_ADMIN: {
    sidebar: {
      activeBg: "bg-blue-600",
      activeText: "text-white",
      hoverBg: "hover:bg-blue-600",
      hoverText: "hover:text-white",
      labelColor: "text-blue-500",
    },
    card: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      hoverBg: "hover:bg-blue-100",
    },
    avatar: "bg-blue-600",
    accent: "text-blue-600",
  },
  TEACHER: {
    sidebar: {
      activeBg: "bg-emerald-600",
      activeText: "text-white",
      hoverBg: "hover:bg-emerald-600",
      hoverText: "hover:text-white",
      labelColor: "text-emerald-500",
    },
    card: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      hoverBg: "hover:bg-emerald-100",
    },
    avatar: "bg-emerald-600",
    accent: "text-emerald-600",
  },
  PARENT: {
    sidebar: {
      activeBg: "bg-amber-500",
      activeText: "text-white",
      hoverBg: "hover:bg-amber-500",
      hoverText: "hover:text-white",
      labelColor: "text-amber-500",
    },
    card: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      hoverBg: "hover:bg-amber-100",
    },
    avatar: "bg-amber-500",
    accent: "text-amber-500",
  },
}
