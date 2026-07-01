type ProgressiveBlurProps = {
  className?: string
  position?: "top" | "bottom"
  height?: string
  blurAmount?: string
}

const ProgressiveBlur = ({
  className = "",
  position = "top",
  height = "150px",
  blurAmount = "4px",
}: ProgressiveBlurProps) => {
  const isTop = position === "top"

  return (
    <div
      className={`pointer-events-none absolute left-0 w-full select-none ${className}`}
      style={{
        [isTop ? "top" : "bottom"]: 0,
        height,
        background: isTop
          ? "linear-gradient(to top, transparent, var(--legal-bg))"
          : "linear-gradient(to bottom, transparent, var(--legal-bg))",
        maskImage: isTop
          ? "linear-gradient(to bottom, var(--legal-bg) 50%, transparent)"
          : "linear-gradient(to top, var(--legal-bg) 50%, transparent)",
        WebkitBackdropFilter: `blur(${blurAmount})`,
        backdropFilter: `blur(${blurAmount})`,
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    />
  )
}

export default ProgressiveBlur
