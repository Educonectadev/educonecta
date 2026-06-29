export default function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className} fill="currentColor">
      <g>
        <polygon points="256,80 420,160 256,240 92,160" />
        <polygon points="175,228 337,228 310,345 202,345" />
        <circle cx="256" cy="160" r="10" />
        <path d="M163 228 Q256 250 349 228" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M256 240 L256 345" opacity="0.3" strokeWidth="2" />
        <path d="M264 168 Q278 220 272 285" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M272 285 L264 308" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M272 285 L276 310" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M272 285 L284 306" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}
