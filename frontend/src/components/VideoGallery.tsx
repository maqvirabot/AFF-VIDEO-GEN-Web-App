'use client'

import { Download, Film, Calendar } from 'lucide-react'
import { useAppStore, VideoTask } from '@/lib/store'

export function VideoGallery() {
    const { queue } = useAppStore()

    const completedTasks = queue.filter((t) => t.status === 'completed').sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    if (completedTasks.length === 0) {
        return null
    }

    return (
        <div className="space-y-4 mt-12">
            <div className="flex items-center gap-2">
                <Film className="text-purple-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Riwayat Video</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                    {completedTasks.length}
                </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {completedTasks.map((task) => (
                    <VideoHistoryCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    )
}

function VideoHistoryCard({ task }: { task: VideoTask }) {
    const handleDownload = () => {
        if (task.videoUrl) {
            window.open(task.videoUrl, '_blank')
        }
    }

    return (
        <div className="group relative rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all">
            {/* Video / Thumbnail */}
            <div className="aspect-[9/16] bg-slate-900 relative">
                {task.videoUrl ? (
                    <video
                        src={task.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        poster={task.thumbnailUrl || undefined}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                        <Film size={32} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 bg-slate-900/90 absolute bottom-0 inset-x-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(task.createdAt).toLocaleDateString()}
                    </div>

                    {task.videoUrl && (
                        <button
                            onClick={handleDownload}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Unduh"
                        >
                            <Download size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* ID Badge */}
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-[10px] text-slate-300 font-mono backdrop-blur-sm">
                {task.id.slice(0, 8)}...
            </div>
        </div>
    )
}
