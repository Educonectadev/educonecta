import type { ReactNode } from "react"

interface NeonCardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  glow?: boolean
  padded?: boolean
  delay?: number
}

export default function NeonCard({
  children,
  className = "",
  hoverable = true,
  glow = false,
  padded = true,
}: NeonCardProps) {
  return (
    <div
      className={[
        "sa-surface",
        hoverable ? "sa-surface-hover" : "",
        glow ? "sa-glow" : "",
        padded ? "p-6" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  )
}