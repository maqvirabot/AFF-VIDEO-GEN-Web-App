'use client'

import { useAppStore } from '@/lib/store'

export function SettingsPanel() {
    const { form, setForm } = useAppStore()

    return (
        <div className="space-y-6">
            {/* Aspect Ratio */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                    Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setForm({ aspectRatio: 'portrait' })}
                        className={`py-3 rounded-xl border-2 font-medium transition-all ${form.aspectRatio === 'portrait'
                            ? 'border-purple-500 bg-purple-500/10 text-white'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                            <div className="w-3 h-5 rounded-sm border-2 border-current" />
                            <span className="text-xs sm:text-base">9:16 Portrait</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setForm({ aspectRatio: 'landscape' })}
                        className={`py-3 rounded-xl border-2 font-medium transition-all ${form.aspectRatio === 'landscape'
                            ? 'border-purple-500 bg-purple-500/10 text-white'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                            <div className="w-5 h-3 rounded-sm border-2 border-current" />
                            <span className="text-xs sm:text-base">16:9 Landscape</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                    Duration
                </label>
                <div className="flex gap-3">
                    <button
                        onClick={() => setForm({ duration: 10 })}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${form.duration === 10
                            ? 'border-cyan-500 bg-cyan-500/10 text-white'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        10 seconds
                    </button>

                    <button
                        onClick={() => setForm({ duration: 15 })}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${form.duration === 15
                            ? 'border-cyan-500 bg-cyan-500/10 text-white'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        15 seconds
                    </button>
                </div>
            </div>

            {/* Batch Count */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                    Number of Videos: <span className="text-purple-400 font-bold">{form.batchCount}</span>
                </label>
                <input
                    type="range"
                    min={1}
                    max={5}
                    value={form.batchCount}
                    onChange={(e) => setForm({ batchCount: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                </div>
            </div>

            {/* Remove Watermark */}
            <div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">
                        Remove Watermark
                    </label>
                    <button
                        onClick={() => setForm({ removeWatermark: !form.removeWatermark })}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.removeWatermark
                            ? 'bg-purple-500'
                            : 'bg-slate-700'
                            }`}
                    >
                        <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${form.removeWatermark ? 'left-6' : 'left-0.5'
                                }`}
                        />
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Remove AI watermark from generated video</p>
            </div>
        </div>
    )
}
