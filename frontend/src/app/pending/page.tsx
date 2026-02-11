'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function PendingPage() {
    const { user, isAuthenticated, isApproved, isLoading, logout, refreshUser } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login')
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (isApproved) {
            router.replace('/')
        }
    }, [isApproved, router])

    // Auto-check approval every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshUser()
        }, 30000)
        return () => clearInterval(interval)
    }, [refreshUser])

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Animated clock icon */}
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-6">
                    <Clock size={40} className="text-amber-400 animate-pulse" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">
                    Menunggu Persetujuan
                </h1>

                <p className="text-slate-400 mb-2">
                    Halo <span className="text-white font-medium">{user?.name}</span> 👋
                </p>

                <p className="text-slate-500 mb-8">
                    Akun Anda ({user?.email}) sedang menunggu persetujuan admin.
                    Halaman ini akan otomatis refresh setiap 30 detik.
                </p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => refreshUser()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Cek Status
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}
