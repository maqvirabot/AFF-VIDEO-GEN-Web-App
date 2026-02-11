'use client'

import { User, Shirt } from 'lucide-react'
import { useAppStore, PersonaType } from '@/lib/store'

const personas: { id: PersonaType; label: string; icon: React.ReactNode; description: string }[] = [
    {
        id: 'wanita_indo',
        label: 'Wanita Indo',
        icon: <User size={24} />,
        description: 'Wanita Indonesia modis',
    },
    {
        id: 'pria_indo',
        label: 'Pria Indo',
        icon: <User size={24} />,
        description: 'Pria Indonesia profesional',
    },
    {
        id: 'hijabers',
        label: 'Hijabers',
        icon: <User size={24} />,
        description: 'Wanita berhijab elegan',
    },
    {
        id: 'product_only',
        label: 'Hanya Produk',
        icon: <Shirt size={24} />,
        description: 'Fokus produk tanpa model',
    },
]

export function PersonaSelector() {
    const { form, setForm } = useAppStore()

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
                Persona Model
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {personas.map((persona) => (
                    <button
                        key={persona.id}
                        onClick={() => setForm({ persona: persona.id })}
                        className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 aspect-[4/3] text-center ${form.persona === persona.id
                            ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                            }`}
                    >
                        {/* Icon */}
                        <div
                            className={`mb-3 p-3 rounded-full transition-colors ${form.persona === persona.id
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                                }`}
                        >
                            {persona.icon}
                        </div>

                        {/* Label */}
                        <div
                            className={`font-medium text-sm mb-1 ${form.persona === persona.id ? 'text-white' : 'text-slate-300'
                                }`}
                        >
                            {persona.label}
                        </div>

                        {/* Description */}
                        <div className="text-xs text-slate-500 leading-tight px-1">
                            {persona.description}
                        </div>

                        {/* Selected indicator */}
                        {form.persona === persona.id && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
