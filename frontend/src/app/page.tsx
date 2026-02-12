'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Aff Video Gen Logo" className="w-8 h-8" />
              <span className="font-bold text-lg tracking-tight">Aff Video Gen</span>
            </div>

            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="w-20 h-8 rounded-lg bg-slate-800 animate-pulse" />
              ) : isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors border border-slate-700"
                >
                  Buka Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-colors text-white shadow-lg shadow-purple-500/20"
                >
                  Masuk / Daftar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-8">
            <span className="flex w-2 h-2 rounded-full bg-purple-400 mr-2 animate-pulse"></span>
            Sekarang dengan Engine AI terbaru
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8">
            Buat Video Afiliasi <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Dalam Hitungan Detik
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Platform AI all-in-one untuk konten kreator afiliasi.
            Ubah gambar produk menjadi video viral TikTok/Reels dengan narasi suara manusia dan visual memukau.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold shadow-xl shadow-purple-500/20 transition-all hover:scale-105"
              >
                Mulai Membuat Video →
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold transition-all hover:scale-105"
              >
                Coba Sekarang Gratis
              </Link>
            )}

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium transition-colors"
            >
              Pelajari Cara Kerja
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="max-w-6xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
          {[
            {
              title: "AI Scriptwriting",
              desc: "Otomatis membuat naskah persuasif berdasarkan deskripsi produk Anda.",
              icon: "📝"
            },
            {
              title: "Voiceover Natural",
              desc: "Beragam pilihan suara AI bahasa Indonesia yang terdengar alami dan emosional.",
              icon: "🎙️"
            },
            {
              title: "Visual Dinamis",
              desc: "Generate video dengan efek zoom, pan, dan transisi profesional secara otomatis.",
              icon: "✨"
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-purple-500/30 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Proses sederhana untuk mengubah gambar produk menjadi video penjualan yang efektif.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20" />

            {[
              {
                step: "01",
                title: "Upload Produk",
                desc: "Unggah foto produk afiliasi Anda. AI akan menganalisis visualnya secara otomatis."
              },
              {
                step: "02",
                title: "Kustomisasi",
                desc: "Pilih gaya visual yang diinginkan dan tentukan persona target audiens Anda."
              },
              {
                step: "03",
                title: "Generate",
                desc: "Satu klik untuk membuat naskah, voiceover, dan visual video yang menarik."
              },
              {
                step: "04",
                title: "Download",
                desc: "Video siap diposting ke TikTok, Reels, atau Shorts untuk mendulang komisi."
              }
            ].map((item, i) => (
              <div key={i} className="relative pt-8 text-center group">
                <div className="w-10 h-10 mx-auto bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-slate-300 mb-6 relative z-10 group-hover:border-purple-500 group-hover:text-purple-400 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-black/20 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 Aff Video Gen. Crafted by <a href="" target="_blank" rel="noopener noreferrer"></a>MaqviraID.</p>
        </div>
      </footer>
    </div>
  )
}
