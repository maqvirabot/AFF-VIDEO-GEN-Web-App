/**
 * Global state store using Zustand
 * Config (API keys) now stored in backend DB — only UI state here
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StyleType = 'unboxing' | 'review' | 'tutorial' | 'showcase' | 'testimonial'
export type PersonaType = 'wanita_indo' | 'pria_indo' | 'hijabers' | 'product_only'
export type AspectRatio = 'portrait' | 'landscape'
export type TaskStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed'

export interface VideoTask {
    id: string
    status: TaskStatus
    progress: number
    videoUrl: string | null
    thumbnailUrl: string | null
    error: string | null
    createdAt: Date
}

interface FormData {
    imageUrl: string | null
    imagePreview: string | null
    productName: string
    highlight: string
    style: StyleType
    persona: PersonaType
    aspectRatio: AspectRatio
    duration: 10 | 15
    batchCount: number
    removeWatermark: boolean
}

interface AppState {
    // Form
    form: FormData
    setForm: (form: Partial<FormData>) => void
    resetForm: () => void

    // Queue
    queue: VideoTask[]
    addTask: (task: VideoTask) => void
    updateTask: (id: string, updates: Partial<VideoTask>) => void
    removeTask: (id: string) => void
    clearCompleted: () => void
    setQueue: (tasks: VideoTask[]) => void

    // UI
    isGenerating: boolean
    setIsGenerating: (val: boolean) => void
    credits: number | null
    setCredits: (val: number | null) => void
    refreshCredits: () => Promise<void>
}

import { api } from '@/lib/api' // Add import at top

const defaultForm: FormData = {
    imageUrl: null,
    imagePreview: null,
    productName: '',
    highlight: '',
    style: 'review',
    persona: 'wanita_indo',
    aspectRatio: 'portrait',
    duration: 10,
    batchCount: 1,
    removeWatermark: true,
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Form
            form: defaultForm,
            setForm: (updates) => set((state) => ({
                form: { ...state.form, ...updates }
            })),
            resetForm: () => set({ form: defaultForm }),

            // Queue
            queue: [],
            addTask: (task) => set((state) => ({
                queue: [...state.queue, task]
            })),
            updateTask: (id, updates) => set((state) => ({
                queue: state.queue.map((t) => t.id === id ? { ...t, ...updates } : t)
            })),
            removeTask: (id) => set((state) => ({
                queue: state.queue.filter((t) => t.id !== id)
            })),
            clearCompleted: () => set((state) => ({
                queue: state.queue.filter((t) => t.status !== 'completed')
            })),
            setQueue: (tasks: VideoTask[]) => set({ queue: tasks }),

            // UI
            isGenerating: false,
            setIsGenerating: (val) => set({ isGenerating: val }),
            credits: null,
            setCredits: (val) => set({ credits: val }),
            refreshCredits: async () => {
                try {
                    const result = await api.getCreditBalance()
                    if (result.success && result.credits !== undefined) {
                        set({ credits: result.credits })
                    }
                } catch (error) {
                    console.error('Failed to refresh credits:', error)
                }
            },
        }),
        {
            name: 'aff-video-gen-storage',
            partialize: () => ({
                // Only persist minimal UI state, no config
            }),
        }
    )
)
