"use client"

interface Partner {
  id: number
  name: string
  logoUrl: string
}

export default function InstitutionLogos({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null

  return (
    <section className="py-16 sm:py-20">
      <h3 className="text-base text-center text-zinc-500 dark:text-zinc-500 pb-12 font-medium">
        Instituciones que ya confían en EduConecta
      </h3>
      <div className="overflow-hidden w-full relative max-w-5xl mx-auto select-none">
        <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white dark:from-black to-transparent" />

        <div className="flex marquee-inner will-change-transform max-w-5xl mx-auto">
          {[...partners, ...partners].map((partner, index) => (
            <img
              key={`${partner.id}-${index}`}
              src={partner.logoUrl}
              alt={partner.name}
              title={partner.name}
              className="w-full h-full object-cover mx-6 brightness-0 dark:brightness-0 dark:invert opacity-40 dark:opacity-50"
              draggable={false}
            />
          ))}
        </div>

        <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white dark:from-black to-transparent" />
      </div>

      <style>{`
        .marquee-inner {
          animation: marqueeScroll 25s linear infinite;
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
