'use client'

import { Download, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAppStore, VideoTask } from '@/lib/store'

export function VideoQueue() {
    const { queue, removeTask } = useAppStore()

    // Show active (pending, queued, processing) and failed tasks
    // Completed tasks go to Gallery
    const activeTasks = queue.filter(t => t.status !== 'completed')

    if (activeTasks.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Antrean Saat Ini</h2>
                <div className="bg-purple-500/10 px-2 py-1 rounded text-purple-400 text-xs font-mono">
                    {activeTasks.length} Aktif
                </div>
            </div>

            <div className="grid gap-3">
                {activeTasks.map((task) => (
                    <VideoTaskCard key={task.id} task={task} onRemove={() => removeTask(task.id)} />
                ))}
            </div>
        </div>
    )
}

function VideoTaskCard({ task, onRemove }: { task: VideoTask; onRemove: () => void }) {
    const getStatusIcon = () => {
        switch (task.status) {
            case 'pending':
            case 'queued':
                return <Clock className="text-yellow-400" size={20} />
            case 'processing':
                return <Loader2 className="text-blue-400 animate-spin" size={20} />
            case 'completed':
                return <CheckCircle className="text-green-400" size={20} />
            case 'failed':
                return <XCircle className="text-red-400" size={20} />
        }
    }

    const getStatusText = () => {
        switch (task.status) {
            case 'pending':
                return 'Menunggu'
            case 'queued':
                return 'Dalam Antrean'
            case 'processing':
                return `Memproses ${task.progress}%`
            case 'completed':
                return 'Selesai'
            case 'failed':
                return 'Gagal'
        }
    }

    const handleDownload = () => {
        if (task.videoUrl) {
            window.open(task.videoUrl, '_blank')
        }
    }

    return (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="text-sm font-medium text-slate-300">
                        {getStatusText()}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {task.status === 'completed' && task.videoUrl && (
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm"
                        >
                            <Download size={16} />
                            Unduh
                        </button>
                    )}

                    {(task.status === 'completed' || task.status === 'failed') && (
                        <button
                            onClick={onRemove}
                            className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
                        >
                            Hapus
                        </button>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {(task.status === 'processing' || task.status === 'queued') && (
                <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${task.progress}%` }}
                    />
                </div>
            )}

            {/* Video preview for completed */}
            {task.status === 'completed' && task.videoUrl && (
                <video
                    src={task.videoUrl}
                    controls
                    className="w-full rounded-lg"
                    poster={task.thumbnailUrl || undefined}
                />
            )}

            {/* Error message */}
            {task.status === 'failed' && task.error && (
                <p className="text-sm text-red-400">{task.error}</p>
            )}

            {/* Task ID */}
            <p className="text-xs text-slate-600 font-mono">
                ID: {task.id}
            </p>
        </div>
    )
}
