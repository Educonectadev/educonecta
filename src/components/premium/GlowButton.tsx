"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

type Variant = "primary" | "ghost" | "outline"

interface GlowButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: Variant
  className?: string
  icon?: ReactNode
  iconRight?: ReactNode
  size?: "sm" | "md"
  type?: "button" | "submit"
  disabled?: boolean
}

export default function GlowButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  icon,
  iconRight,
  size = "md",
  type = "button",
  disabled,
}: GlowButtonProps) {
  const base =
    "sa-btn " +
    (variant === "primary"
      ? "sa-btn-primary"
      : variant === "ghost"
      ? "sa-btn-ghost"
      : "sa-btn-outline") +
    (size === "sm" ? " text-xs px-4 py-1.5" : "")

  const inner = (
    <motion.span
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={[base, disabled ? "opacity-50 pointer-events-none" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
      <span>{children}</span>
      {iconRight}
    </motion.span>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {inner}
      </Link>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="inline-flex">
      {inner}
    </button>
  )
}