'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, CreditCard, Save, Check, AlertCircle, LogOut, Shield, Key } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api'

export function Header() {
    const { user, isAdmin, logout } = useAuth()
    const { credits, setCredits, refreshCredits } = useAppStore()
    const router = useRouter()

    const [showSettings, setShowSettings] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [kieApiKey, setKieApiKey] = useState('')
    const [hasExistingKey, setHasExistingKey] = useState(false)

    // Load saved key info and credit balance on mount + auto-refresh
    useEffect(() => {
        loadApiKeyInfo()
        refreshCredits() // Initial load

        // Auto-refresh credit balance every 5 minutes (300s)
        const interval = setInterval(() => {
            refreshCredits()
        }, 300000)

        return () => clearInterval(interval)
    }, [])

    const loadApiKeyInfo = async () => {
        try {
            const result = await api.getApiKeys()
            if (result.success) {
                setHasExistingKey(result.has_kie_key || false)
            }
        } catch { }
    }

    const handleSaveKey = async () => {
        if (!kieApiKey.trim()) return

        setSaving(true)
        setError(null)

        try {
            const result = await api.saveApiKeys(kieApiKey.trim())
            if (result.success) {
                setSaved(true)
                setHasExistingKey(true)
                setKieApiKey('')

                setKieApiKey('')

                // Refresh credit balance
                refreshCredits()

                setTimeout(() => {
                    setSaved(false)
                    setShowSettings(false)
                }, 1500)
            } else {
                setError('Failed to save API key')
            }
        } catch {
            setError('Network error saving API key')
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg font-bold text-white">Aff Video Gen</h1>
                        <p className="text-xs text-slate-400">Generator Video AI Affiliate</p>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* Credits display */}
                    {credits !== null && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                            <CreditCard size={16} className="text-cyan-400" />
                            <span className="text-sm font-medium text-white">{credits.toLocaleString()}</span>
                            <span className="hidden sm:inline text-xs text-slate-400">kredit</span>
                        </div>
                    )}

                    {/* API Key status */}
                    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${hasExistingKey
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                        <Key size={12} />
                        {hasExistingKey ? 'API Key Tersimpan' : 'API Key Kosong'}
                    </div>

                    {/* Admin button */}
                    {isAdmin && (
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Admin Panel"
                        >
                            <Shield size={20} className="text-purple-400" />
                        </button>
                    )}

                    {/* Settings button */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <Settings size={20} className={showSettings ? 'text-purple-400' : 'text-slate-400'} />
                    </button>

                    {/* User avatar + logout */}
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
                                {user?.name?.charAt(0) || '?'}
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                            title="Keluar"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings panel — API Key only */}
            {showSettings && (
                <div className="border-t border-slate-700/50 bg-slate-800/50 backdrop-blur">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <h3 className="text-sm font-medium text-slate-300 mb-4">Konfigurasi API Key</h3>

                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-slate-400 mb-1">
                                    {hasExistingKey ? 'Masukkan key baru untuk update' : 'Masukkan Kie.ai API key Anda'}
                                </label>
                                <input
                                    type="password"
                                    value={kieApiKey}
                                    onChange={(e) => setKieApiKey(e.target.value)}
                                    placeholder={hasExistingKey ? '••••••••••••' : 'Masukkan API key'}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleSaveKey}
                                disabled={saving || saved || !kieApiKey.trim()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${saved
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                                    } disabled:opacity-50`}
                            >
                                {saved ? (
                                    <><Check size={16} /> Tersimpan!</>
                                ) : (
                                    <><Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan'}</>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
