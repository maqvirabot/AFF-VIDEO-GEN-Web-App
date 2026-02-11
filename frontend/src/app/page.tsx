'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Header } from '@/components/Header'
import { ImageUploader } from '@/components/ImageUploader'
import { ProductForm } from '@/components/ProductForm'
import { StyleSelector } from '@/components/StyleSelector'
import { PersonaSelector } from '@/components/PersonaSelector'
import { SettingsPanel } from '@/components/SettingsPanel'
import { GenerateButton } from '@/components/GenerateButton'
import { VideoQueue } from '@/components/VideoQueue'
import { VideoGallery } from '@/components/VideoGallery'
import { usePolling } from '@/hooks/usePolling'

export default function Home() {
  const { isAuthenticated, isApproved, isLoading } = useAuth()
  const router = useRouter()

  // Enable polling for task status
  usePolling(5000)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (!isApproved) {
        router.replace('/pending')
      }
    }
  }, [isAuthenticated, isApproved, isLoading, router])

  if (isLoading || !isAuthenticated || !isApproved) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Generator Video AI
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Buat video afiliasi memukau dengan AI.
            Cukup upload gambar produk, berikan deskripsi, dan biarkan AI bekerja.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-8">
          {/* Image Upload */}
          <ImageUploader />

          {/* Product Details */}
          <ProductForm />

          {/* Visual Settings */}
          <div className="grid gap-8 lg:grid-cols-2">
            <StyleSelector />
            <PersonaSelector />
          </div>

          {/* Video Settings */}
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <SettingsPanel />
          </div>

          {/* Generate Button */}
          <GenerateButton />
        </div>

        {/* Video Queue */}
        <div className="mt-8">
          <VideoQueue />
          <VideoGallery />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-600">
          <p>Powered by Kie.ai Sora 2 • Cloudinary for Image Hosting</p>
        </footer>
      </main>
    </div>
  )
}
