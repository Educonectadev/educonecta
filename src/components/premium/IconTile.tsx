"use client"

import { motion } from "framer-motion"
import type { LucideProps } from "lucide-react"
import * as Icons from "lucide-react"

const iconMap: Record<string, keyof typeof Icons> = {
  home: "Home",
  dashboard: "LayoutDashboard",
  mail: "Mail",
  account_balance: "Landmark",
  groups: "Users",
  card_membership: "CreditCard",
  history: "History",
  settings: "Settings",
  bolt: "Zap",
  inbox: "Inbox",
  spark: "Sparkles",
  chat: "MessageCircle",
  search: "Search",
  bell: "Bell",
  calendar: "Calendar",
  rocket: "Rocket",
  plus: "Plus",
  arrow_right: "ArrowRight",
  arrow_up_right: "ArrowUpRight",
  check: "Check",
  x: "X",
  building: "Building2",
  users: "Users",
  school: "GraduationCap",
  credit_card: "CreditCard",
  edit: "Pencil",
  trash: "Trash2",
  eye: "Eye",
  refresh: "RefreshCw",
  filter: "SlidersHorizontal",
  download: "Download",
  external: "ExternalLink",
  layers: "Layers",
  trending: "TrendingUp",
  trending_down: "TrendingDown",
  wallet: "Wallet",
  shield: "ShieldCheck",
  lock: "Lock",
  globe: "Globe",
  pin: "Pin",
  pin_filled: "Pin",
  star: "Star",
  zap: "Zap",
  percent: "Percent",
  package: "Package",
  message: "MessageSquare",
  more: "MoreHorizontal",
  list: "List",
  grid: "LayoutGrid",
  layout: "LayoutDashboard",
  crown: "Crown",
  flask: "FlaskConical",
  palette: "Palette",
  tag: "Tag",
  clock: "Clock",
  chart: "BarChart3",
  chart_line: "LineChart",
  chart_pie: "PieChart",
  pulse: "Activity",
  database: "Database",
  cloud: "Cloud",
  server: "Server",
  devices: "Smartphone",
  map: "MapPin",
  power: "Power",
  lifebuoy: "LifeBuoy",
  arrow_left: "ArrowLeft",
}

export function getIcon(
  name: string,
  props?: LucideProps
): React.ReactElement | null {
  const key = iconMap[name]
  if (!key) return null
  const Cmp = Icons[key] as React.ComponentType<LucideProps>
  return <Cmp {...props} />
}

interface IconTileProps {
  name: string
  size?: number
  className?: string
  filled?: boolean
  active?: boolean
}

export default function IconTile({
  name,
  size = 18,
  className = "",
  filled = false,
  active = false,
}: IconTileProps) {
  return (
    <motion.span
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={[
        "inline-flex items-center justify-center rounded-full",
        filled
          ? active
            ? "bg-black/15"
            : "bg-white/8 dark:bg-white/10"
          : "",
        className,
      ].join(" ")}
      style={{ width: size + 14, height: size + 14 }}
    >
      {getIcon(name, { size, strokeWidth: 1.8 })}
    </motion.span>
  )
}