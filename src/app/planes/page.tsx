"use client"

import { useState } from "react"
import Link from "next/link"
import SiteFooter from "@/components/SiteFooter"
import ThemeToggle from "@/components/ThemeToggle"

interface Plan {
    name: string
    monthlyPrice: number
    yearlyPrice: number
    tagline: string
    isPopular?: boolean
    features: string[]
}

const pricingPlans: Plan[] = [
    {
        name: "Esencial",
        monthlyPrice: 2,
        yearlyPrice: 1.5,
        tagline: "Para colegios que recién empiezan a digitalizarse.",
        features: [
            "Hasta 50 estudiantes",
            "Registro de asistencia",
            "Calificaciones básicas",
            "Tareas y comunicados",
            "Horarios de clase",
        ],
    },
    {
        name: "Profesional",
        monthlyPrice: 2,
        yearlyPrice: 1.5,
        tagline: "El más usado por colegios en crecimiento.",
        isPopular: true,
        features: [
            "Hasta 500 estudiantes",
            "Registro de asistencia",
            "Calificaciones básicas",
            "Tareas y comunicados",
            "Horarios de clase",
            "Notificaciones push",
            "Módulo de disciplina",
            "Reportes y exportación",
        ],
    },
    {
        name: "Institucional",
        monthlyPrice: 2,
        yearlyPrice: 1.5,
        tagline: "Para redes educativas y colegios grandes.",
        features: [
            "Estudiantes ilimitados",
            "Registro de asistencia",
            "Calificaciones básicas",
            "Tareas y comunicados",
            "Horarios de clase",
            "Notificaciones push",
            "Módulo de disciplina",
            "Reportes y exportación",
            "Soporte prioritario 24/7",
            "Dominio personalizado",
            "Multi-sede",
        ],
    },
]

export default function PlanesPage() {
    const [isYearly, setIsYearly] = useState(false)

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-black">
            <header className="border-b border-gray-100 dark:border-zinc-800">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/" className="text-lg font-bold tracking-tight text-gray-900 dark:text-white/90">
                        EduConecta
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                        >
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="w-full bg-white dark:bg-black py-20 px-4 flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-medium text-zinc-800 dark:text-white/90 text-center">Planes y Aporte</h1>
                    <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-400 mt-4 text-center">Elige el plan ideal para tu colegio.</p>

                    <div className="mt-8 flex items-center bg-zinc-900 dark:bg-zinc-800 rounded-full p-1 w-fit mx-auto cursor-pointer select-none" onClick={() => setIsYearly(!isYearly)}>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-500 ease-in-out ${!isYearly ? 'bg-white text-zinc-900' : 'text-white dark:text-zinc-400'}`} onClick={(e) => { e.stopPropagation(); setIsYearly(false); }}>
                            Mensual
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-500 ease-in-out ${isYearly ? 'bg-white text-zinc-900' : 'text-white dark:text-zinc-400'}`} onClick={(e) => { e.stopPropagation(); setIsYearly(true); }}>
                            Anual
                        </div>
                    </div>

                    <div className="max-w-[1100px] mx-auto w-full mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pricingPlans.map((plan, index) => (
                            <div key={index} className={`flex flex-col border-[3px] ${plan.isPopular ? 'border-slate-800 dark:border-zinc-600 hover:border-slate-900 dark:hover:border-zinc-500' : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'} rounded-2xl p-6 bg-white dark:bg-black transition-colors relative`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-medium text-zinc-900 dark:text-white/90">{plan.name}</h3>
                                    {plan.isPopular && (
                                        <span className="text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-600 dark:border-zinc-600 rounded-full px-3 py-1 text-slate-800 dark:text-zinc-300">Más popular</span>
                                    )}
                                </div>

                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{plan.tagline}</p>
                                
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-semibold text-zinc-900 dark:text-white">S/ {isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                                    <span className="text-sm text-zinc-500 dark:text-zinc-400">/ familia / mes</span>
                                </div>
                                
                                <hr className="border-t border-zinc-200 dark:border-zinc-800 w-full my-5.5" />

                                <ul className="flex flex-col gap-3 grow">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2.5 text-base text-zinc-800 dark:text-zinc-300">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.534 6.664a6.666 6.666 0 1 1-3.2-4.444"/><path d="m6 7.33 2 2 6.667-6.666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className="mt-10 w-full bg-zinc-950 dark:bg-white text-white dark:text-black text-base font-medium py-3 rounded-full transition-colors hover:bg-zinc-900 dark:hover:bg-zinc-200 cursor-pointer">
                                    Quiero este plan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    )
}
