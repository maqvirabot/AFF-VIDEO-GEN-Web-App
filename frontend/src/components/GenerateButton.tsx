'use client'

import { Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export function GenerateButton() {
    const { form, isGenerating, setIsGenerating, addTask, refreshCredits } = useAppStore()
    const { isAuthenticated, isApproved } = useAuth()
    const router = useRouter()

    const canGenerate =
        form.imageUrl &&
        form.productName.trim() &&
        form.highlight.trim() &&
        !isGenerating

    const handleGenerate = async () => {
        if (!canGenerate) return

        if (!isAuthenticated || !isApproved) {
            router.push('/login')
            return
        }

        setIsGenerating(true)

        try {
            const result = await api.generateTask({
                imageUrl: form.imageUrl!,
                productName: form.productName,
                highlight: form.highlight,
                style: form.style,
                persona: form.persona,
                aspectRatio: form.aspectRatio,
                duration: form.duration,
                batchCount: form.batchCount,
                removeWatermark: form.removeWatermark,
            })

            if (result.success && result.task_ids) {
                result.task_ids.forEach((taskId) => {
                    addTask({
                        id: taskId,
                        status: 'pending',
                        progress: 0,
                        videoUrl: null,
                        thumbnailUrl: null,
                        error: null,
                        createdAt: new Date(),
                    })
                })
            } else {
                alert(result.error || 'Failed to create task. Make sure your API key is set in Settings.')
            }
        } catch (err) {
            alert('Network error. Please try again.')
            console.error(err)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div>
            <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${canGenerate
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
            >
                {isGenerating ? (
                    <>
                        <Loader2 size={22} className="animate-spin" />
                        Memproses...
                    </>
                ) : (
                    <>
                        <Sparkles size={22} />
                        Buat Video{form.batchCount > 1 ? ` (${form.batchCount})` : ''}
                    </>
                )}
            </button>

            {!form.imageUrl && (
                <p className="text-xs text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle size={12} />
                    Upload gambar produk terlebih dahulu
                </p>
            )}
        </div>
    )
}
