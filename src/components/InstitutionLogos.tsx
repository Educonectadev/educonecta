"use client"

interface Partner {
  id: number
  name: string
  logoUrl: string
}

export default function InstitutionLogos({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null

  return (
    <section className="py-16 sm:py-20 overflow-hidden">
      <div className="text-center mb-12">
        <span
          className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase mb-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          Confianza institucional
        </span>
        <h3
          className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight px-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--foreground)",
          }}
        >
          Instituciones que ya confían en{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            EduConecta
          </span>
        </h3>
      </div>

      <div className="relative max-w-6xl mx-auto select-none">
        <div className="absolute left-0 top-0 h-full w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent dark:from-black dark:via-black/80 dark:to-transparent" />
        <div className="absolute right-0 top-0 h-full w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent dark:from-black dark:via-black/80 dark:to-transparent" />

        <div className="marquee-inner will-change-transform flex items-center gap-16 md:gap-24">
          {[...partners, ...partners].map((partner, index) => (
            <span
              key={`${partner.id}-${index}`}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold whitespace-nowrap tracking-wide opacity-40 dark:opacity-50 hover:opacity-70 transition-opacity duration-300"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--foreground)",
              }}
            >
              {partner.name}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .marquee-inner {
          animation: marqueeScroll 30s linear infinite;
          width: fit-content;
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
