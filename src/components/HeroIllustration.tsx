"use client"

export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 800 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="800" height="1000" rx="28" fill="var(--accent-soft)" fillOpacity="0.08" />

      <circle cx="650" cy="150" r="40" fill="var(--accent)" fillOpacity="0.08" />
      <circle cx="120" cy="800" r="60" fill="var(--accent)" fillOpacity="0.06" />
      <rect x="600" y="700" width="80" height="80" rx="16" fill="var(--accent)" fillOpacity="0.06" transform="rotate(15 640 740)" />
      <rect x="100" y="200" width="50" height="50" rx="10" fill="var(--accent)" fillOpacity="0.06" transform="rotate(-10 125 225)" />

      <g transform="translate(280, 280)">
        <rect x="-20" y="60" width="40" height="70" rx="8" fill="var(--foreground)" fillOpacity="0.1" />
        <circle cx="0" cy="30" r="28" fill="var(--foreground)" fillOpacity="0.1" />
        <rect x="18" y="75" width="18" height="24" rx="2" fill="var(--accent)" fillOpacity="0.25" />
      </g>

      <g transform="translate(400, 350)">
        <rect x="-18" y="55" width="36" height="65" rx="8" fill="var(--foreground)" fillOpacity="0.08" />
        <circle cx="0" cy="25" r="26" fill="var(--foreground)" fillOpacity="0.08" />
        <rect x="-25" y="90" width="50" height="32" rx="4" fill="var(--accent)" fillOpacity="0.2" />
        <rect x="-22" y="93" width="44" height="22" rx="2" fill="var(--surface)" fillOpacity="0.4" />
      </g>

      <g transform="translate(520, 300)">
        <rect x="-16" y="50" width="32" height="55" rx="8" fill="var(--foreground)" fillOpacity="0.07" />
        <circle cx="0" cy="22" r="24" fill="var(--foreground)" fillOpacity="0.07" />
        <path d="M-14 70 L0 62 L14 70" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.25" />
      </g>

      <g transform="translate(350, 200)" opacity="0.12">
        <path d="M0 0 L30 10 L15 28 L-15 28 L-30 10 Z" fill="var(--accent)" />
        <rect x="12" y="10" width="6" height="14" rx="2" fill="var(--accent)" />
      </g>

      <g stroke="var(--accent)" strokeWidth="1.5" opacity="0.08" fill="none">
        <path d="M280 340 Q340 300 400 380" />
        <path d="M400 380 Q460 340 520 330" />
        <path d="M280 340 Q300 280 350 230" />
      </g>

      <g fill="var(--accent)" fillOpacity="0.05">
        <circle cx="200" cy="500" r="3" />
        <circle cx="220" cy="520" r="3" />
        <circle cx="240" cy="500" r="3" />
        <circle cx="220" cy="480" r="3" />
        <circle cx="560" cy="550" r="3" />
        <circle cx="580" cy="570" r="3" />
        <circle cx="600" cy="550" r="3" />
        <circle cx="580" cy="530" r="3" />
      </g>

      <g transform="translate(580, 200)" opacity="0.1">
        <path d="M0-15a15 15 0 0 1 10 26v4H-10v-4A15 15 0 0 1 0-15Z" fill="var(--accent)" />
        <rect x="-4" y="18" width="8" height="5" rx="2" fill="var(--accent)" />
      </g>
    </svg>
  )
}
