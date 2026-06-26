interface LogoProps {
  className?: string
}

export default function Logo({ className = "size-8" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EduConecta"
      role="img"
    >
      <defs>
        <linearGradient id="edu-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#edu-bg)" />
      <g fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 14.5 L20 11 L32 14.5" />
        <path d="M8 14.5 V25.5 C8 26.6 13.4 28 20 28 C26.6 28 32 26.6 32 25.5 V14.5" />
        <path d="M20 11 V28" />
      </g>
      <g fill="white">
        <rect x="14" y="6" width="14" height="3.2" rx="1" transform="rotate(-12 21 7.6)" />
        <path d="M14.2 7.2 L27.8 7.2 L27.8 8 L21 9.4 L14.2 8 Z" transform="rotate(-12 21 7.6)" />
        <circle cx="21" cy="9.6" r="0.9" transform="rotate(-12 21 7.6)" />
      </g>
      <g stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M12 32 L12 35" />
        <path d="M28 32 L28 35" />
      </g>
    </svg>
  )
}