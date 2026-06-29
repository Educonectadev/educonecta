export default function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className}>
      <g fill="currentColor">
        <polygon points="256,140 380,200 256,260 132,200" />
        <polygon points="176,248 336,248 314,320 198,320" />
        <circle cx="362" cy="214" r="8" />
      </g>
    </svg>
  )
}
