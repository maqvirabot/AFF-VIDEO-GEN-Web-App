'use client'

import { Package, Star, BookOpen, Eye, MessageCircle } from 'lucide-react'
import { useAppStore, StyleType } from '@/lib/store'

const styles: { id: StyleType; label: string; icon: React.ReactNode; description: string }[] = [
    {
        id: 'unboxing',
        label: 'Buka Paket',
        icon: <Package size={24} />,
        description: 'Video unboxing produk',
    },
    {
        id: 'review',
        label: 'Review',
        icon: <Star size={24} />,
        description: 'Ulasan detail produk',
    },
    {
        id: 'tutorial',
        label: 'Tutorial',
        icon: <BookOpen size={24} />,
        description: 'Cara penggunaan',
    },
    {
        id: 'showcase',
        label: 'Showcase',
        icon: <Eye size={24} />,
        description: 'Tampilan sinematik',
    },
    {
        id: 'testimonial',
        label: 'Testimoni',
        icon: <MessageCircle size={24} />,
        description: 'Pengalaman pengguna',
    },
]

export function StyleSelector() {
    const { form, setForm } = useAppStore()

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
                Gaya Video
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {styles.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => setForm({ style: style.id })}
                        className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 aspect-[4/3] text-center ${form.style === style.id
                            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                            }`}
                    >
                        {/* Icon */}
                        <div
                            className={`mb-3 p-3 rounded-full transition-colors ${form.style === style.id
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                                }`}
                        >
                            {style.icon}
                        </div>

                        {/* Label */}
                        <div
                            className={`font-medium text-sm mb-1 ${form.style === style.id ? 'text-white' : 'text-slate-300'
                                }`}
                        >
                            {style.label}
                        </div>

                        {/* Description */}
                        <div className="text-xs text-slate-500 leading-tight px-1">
                            {style.description}
                        </div>

                        {/* Selected indicator */}
                        {form.style === style.id && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
