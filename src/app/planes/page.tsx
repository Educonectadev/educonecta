"use client"

import { useState } from "react"
import Link from "next/link"
import SiteFooter from "@/components/SiteFooter"

const pricingPlans = [
    { name: "Starter Plan", monthlyPrice: 19, yearlyPrice: 15, features: ["Basic task management", "5 projects limit", "Email support", "Community access"] },
    { name: "Growth Plan", monthlyPrice: 29, yearlyPrice: 24, isPopular: true, features: ["Advance task management", "Unlimited projects", "Priority support", "Team collaboration", "Advanced analytics"] },
    { name: "Scale Plan", monthlyPrice: 79, yearlyPrice: 65, features: [ "Everything in Growth", "Unlimited projects", "24/7 priority support", "Advanced security & permissions", "Early access to new features", "Team performance insights"] }
]

export default function PlanesPage() {
    const [isYearly, setIsYearly] = useState(false)

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <header className="border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
                        EduConecta
                    </Link>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors duration-200"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                <div className="w-full bg-white py-20 px-4 flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-medium text-zinc-800 text-center">Simple, Transparent Pricing</h1>
                    <p className="text-sm md:text-base text-zinc-700 mt-4 text-center">Choose a plan that grows with your workflow.</p>

                    <div className="mt-8 flex items-center bg-zinc-900 rounded-full p-1 w-fit mx-auto cursor-pointer select-none" onClick={() => setIsYearly(!isYearly)}>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-500 ease-in-out ${!isYearly ? 'bg-white text-zinc-900' : 'text-white'}`} onClick={(e) => { e.stopPropagation(); setIsYearly(false); }}>
                            Monthly
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-500 ease-in-out ${isYearly ? 'bg-white text-zinc-900' : 'text-white'}`} onClick={(e) => { e.stopPropagation(); setIsYearly(true); }}>
                            Yearly
                        </div>
                    </div>

                    <div className="max-w-[1100px] mx-auto w-full mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pricingPlans.map((plan, index) => (
                            <div key={index} className={`flex flex-col border-[3px] ${plan.isPopular ? 'border-slate-800 hover:border-slate-900' : 'border-slate-200 hover:border-slate-300'} rounded-2xl p-6 bg-white transition-colors relative`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-medium text-zinc-900">{plan.name}</h3>
                                    {plan.isPopular && (
                                        <span className="text-xs bg-slate-50 border border-slate-600 rounded-full px-3 py-1 text-slate-800">Most Popular</span>
                                    )}
                                </div>
                                
                                <div className="mt-4">
                                    <span className="text-4xl font-semibold text-zinc-900">${isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                                </div>
                                <p className="text-zinc-800 text-base mt-2">Billed {isYearly ? 'annually' : 'monthly'}</p>
                                
                                <hr className="border-t border-zinc-200 w-full my-5.5" />

                                <ul className="flex flex-col gap-3 grow">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2.5 text-base text-zinc-800">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)" stroke="#27272a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.534 6.664a6.666 6.666 0 1 1-3.2-4.444"/><path d="m6 7.33 2 2 6.667-6.666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className="mt-10 w-full bg-zinc-950 text-white text-base font-medium py-3 rounded-full transition-colors hover:bg-zinc-900 cursor-pointer">
                                    Get Started
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
