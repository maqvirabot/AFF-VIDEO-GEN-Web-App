/**
 * Polling hook for checking video task status
 * Fetches history from backend and syncs active tasks
 */
import { useEffect, useRef, useCallback } from 'react'
import { useAppStore, TaskStatus, VideoTask } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'

export function usePolling(intervalMs: number = 5000) {
    const { queue, setQueue, refreshCredits } = useAppStore()
    const { isAuthenticated, isApproved } = useAuth()
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const isPollingRef = useRef(false)
    const prevQueueRef = useRef<VideoTask[]>([])

    const fetchTasks = useCallback(async () => {
        if (!isAuthenticated || !isApproved) return

        // Prevent update collision if called rapidly
        if (isPollingRef.current) return
        isPollingRef.current = true

        try {
            const result = await api.getTasks()

            if (result.tasks) {
                // Map API tasks to Store tasks
                const mappedTasks: VideoTask[] = result.tasks.map((t) => ({
                    id: t.task_id,
                    status: t.status as TaskStatus,
                    progress: t.progress,
                    videoUrl: t.video_url,
                    thumbnailUrl: t.thumbnail_url,
                    error: t.error,
                    createdAt: t.created_at ? new Date(t.created_at) : new Date(),
                }))

                // Check for completion/failure events to refresh credits
                // triggers if a task was NOT completed/failed before, but IS now
                const hasStatusChange = mappedTasks.some(newTask => {
                    const oldTask = prevQueueRef.current.find(t => t.id === newTask.id)
                    // If task is new or wasn't completed/failed before, and now is completed/failed
                    if (!oldTask) return false
                    const isNowDone = newTask.status === 'completed' || newTask.status === 'failed'
                    const wasDone = oldTask.status === 'completed' || oldTask.status === 'failed'
                    return isNowDone && !wasDone
                })

                if (hasStatusChange) {
                    refreshCredits()
                }

                // Update store
                setQueue(mappedTasks)
                prevQueueRef.current = mappedTasks
            }
        } catch (error) {
            console.error('Task fetch error:', error)
        } finally {
            isPollingRef.current = false
        }
    }, [isAuthenticated, isApproved, setQueue, refreshCredits])

    // Initial fetch on mount / auth
    useEffect(() => {
        if (isAuthenticated && isApproved) {
            fetchTasks()
        }
    }, [isAuthenticated, isApproved, fetchTasks])

    // Polling logic
    useEffect(() => {
        const hasActiveTasks = queue.some(
            (t) => t.status === 'pending' || t.status === 'queued' || t.status === 'processing'
        )

        if (isAuthenticated && isApproved && hasActiveTasks) {
            if (!intervalRef.current) {
                intervalRef.current = setInterval(fetchTasks, intervalMs)
            }
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [queue, isAuthenticated, isApproved, intervalMs, fetchTasks])

    return { refresh: fetchTasks }
}
