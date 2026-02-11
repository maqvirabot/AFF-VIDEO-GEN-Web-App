'use client'

import { useAppStore } from '@/lib/store'

export function ProductForm() {
    const { form, setForm } = useAppStore()

    return (
        <div className="space-y-4">
            {/* Product Name */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nama Produk
                </label>
                <input
                    type="text"
                    value={form.productName}
                    onChange={(e) => setForm({ productName: e.target.value })}
                    placeholder="Contoh: Sepatu Nike Air Max"
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
            </div>

            {/* Highlight / Key Feature */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fitur Utama / Highlight
                </label>
                <textarea
                    value={form.highlight}
                    onChange={(e) => setForm({ highlight: e.target.value })}
                    placeholder="Contoh: Bahan sangat nyaman, cocok untuk lari seharian"
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                    {form.highlight.length}/500 karakter
                </p>
            </div>
        </div>
    )
}
