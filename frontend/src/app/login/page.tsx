'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
    const { isAuthenticated, isLoading, login } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard')
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        // Load Google Identity Services script
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
            if (!clientId) {
                console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID not set')
                return
            }

            // @ts-ignore
            window.google?.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleResponse,
            })

            // @ts-ignore
            window.google?.accounts.id.renderButton(
                document.getElementById('google-signin-btn'),
                {
                    theme: 'filled_black',
                    size: 'large',
                    width: 320,
                    text: 'signin_with',
                    shape: 'pill',
                }
            )
        }
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const handleGoogleResponse = async (response: { credential: string }) => {
        const result = await login(response.credential)
        if (result.success) {
            router.replace('/dashboard')
        } else {
            alert(result.error || 'Login failed')
        }
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
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="Aff Video Gen Logo" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Aff Video Gen</h1>
                    <p className="text-slate-400">AI Video Generator for Affiliate Marketing</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
                    <h2 className="text-xl font-semibold text-white text-center mb-6">
                        Sign in to continue
                    </h2>

                    {/* Google Sign In Button */}
                    <div className="flex justify-center">
                        <div id="google-signin-btn" />
                    </div>

                    <p className="text-xs text-slate-500 text-center mt-6">
                        New accounts require admin approval before accessing the video generator.
                    </p>
                </div>

                {/* Footer */}
                <p className="text-xs text-slate-600 text-center mt-6">
                    © 2024 Aff Video Gen. Crafted by <a href="" target="_blank" rel="noopener noreferrer"></a>MaqviraID.
                </p>
            </div>
        </div>
    )
}
