'use client'

/**
 * Auth context — manages user session via JWT
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api } from './api'

export interface AuthUser {
    id: number
    email: string
    name: string
    avatar_url: string | null
    role: 'admin' | 'user'
    is_approved: boolean
}

interface AuthContextType {
    user: AuthUser | null
    isLoading: boolean
    isAuthenticated: boolean
    isApproved: boolean
    isAdmin: boolean
    login: (googleIdToken: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [token, setToken] = useState<string | null>(null)

    // Load token from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('auth_token')
        if (saved) {
            setToken(saved)
        } else {
            setIsLoading(false)
        }
    }, [])

    // Fetch user when token changes
    useEffect(() => {
        if (token) {
            api.setToken(token)
            fetchUser()
        } else {
            setIsLoading(false)
        }
    }, [token])

    const fetchUser = async () => {
        try {
            const result = await api.getMe()
            if (result.success && result.user) {
                setUser(result.user)
            } else {
                // Token invalid
                localStorage.removeItem('auth_token')
                setToken(null)
                setUser(null)
            }
        } catch {
            localStorage.removeItem('auth_token')
            setToken(null)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (googleIdToken: string) => {
        try {
            const result = await api.googleLogin(googleIdToken)
            if (result.success && result.token) {
                localStorage.setItem('auth_token', result.token)
                setToken(result.token)
                api.setToken(result.token)
                if (result.user) {
                    setUser(result.user)
                }
                return { success: true }
            }
            return { success: false, error: result.error || 'Login failed' }
        } catch (err) {
            return { success: false, error: 'Network error during login' }
        }
    }

    const logout = async () => {
        try {
            await api.logout()
        } catch { }
        localStorage.removeItem('auth_token')
        setToken(null)
        setUser(null)
        api.setToken(null)
    }

    const refreshUser = async () => {
        if (token) {
            await fetchUser()
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isApproved: user?.is_approved ?? false,
                isAdmin: user?.role === 'admin',
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
