'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, Shield, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'

interface UserItem {
    id: number
    email: string
    name: string
    avatar_url: string | null
    role: string
    is_approved: boolean
    created_at: string
}

export default function AdminPage() {
    const { isAdmin, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<UserItem[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login')
        } else if (!isLoading && !isAdmin) {
            router.replace('/')
        }
    }, [isAdmin, isLoading, isAuthenticated, router])

    useEffect(() => {
        if (isAdmin) {
            loadUsers()
        }
    }, [isAdmin])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const result = await api.getUsers()
            setUsers(result.users || [])
        } catch {
            console.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (userId: number) => {
        setActionLoading(userId)
        try {
            await api.approveUser(userId)
            setUsers(users.map(u => u.id === userId ? { ...u, is_approved: true } : u))
        } catch {
            alert('Failed to approve user')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (userId: number) => {
        setActionLoading(userId)
        try {
            await api.rejectUser(userId)
            setUsers(users.map(u => u.id === userId ? { ...u, is_approved: false } : u))
        } catch {
            alert('Failed to reject user')
        } finally {
            setActionLoading(null)
        }
    }

    if (isLoading || !isAdmin) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const pendingUsers = users.filter(u => !u.is_approved && u.role !== 'admin')
    const approvedUsers = users.filter(u => u.is_approved)

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-400" />
                    </button>
                    <Shield size={20} className="text-purple-400" />
                    <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                    <span className="text-sm text-slate-500 ml-auto">
                        {users.length} users
                    </span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Pending Approvals */}
                {pendingUsers.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                            <Users size={20} />
                            Menunggu Persetujuan ({pendingUsers.length})
                        </h2>
                        <div className="space-y-3">
                            {pendingUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-4 p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                                    <img
                                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{user.name}</p>
                                        <p className="text-sm text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(user.id)}
                                            disabled={actionLoading === user.id}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors text-sm disabled:opacity-50"
                                        >
                                            <Check size={14} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.id)}
                                            disabled={actionLoading === user.id}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                                        >
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Users */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Semua User ({users.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {users.map(user => (
                                <div key={user.id} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <img
                                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {user.name}
                                            {user.role === 'admin' && (
                                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                    Admin
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {user.is_approved ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                Pending
                                            </span>
                                        )}
                                        {user.role !== 'admin' && user.is_approved && (
                                            <button
                                                onClick={() => handleReject(user.id)}
                                                disabled={actionLoading === user.id}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                                title="Revoke access"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                        {user.role !== 'admin' && !user.is_approved && (
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                disabled={actionLoading === user.id}
                                                className="p-1.5 rounded-lg hover:bg-green-500/10 text-slate-500 hover:text-green-400 transition-colors disabled:opacity-50"
                                                title="Approve user"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
