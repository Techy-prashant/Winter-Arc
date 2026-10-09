'use client'

import { useState } from 'react'
import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0c10] text-gray-200">
      {/* LEFT: Branding / Editorial */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-white/5 bg-[#05070a]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 text-xs tracking-[0.2em] font-medium uppercase text-white/50">
          WINTER ARC
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-5xl font-medium tracking-tight text-white leading-tight">
            Your progress.<br/>
            Your discipline.<br/>
            Your arc.
          </h1>
        </div>

        <div className="relative z-10 text-[10px] tracking-[0.2em] uppercase text-white/30">
          NAMDAPHA &copy; 2026
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Noise overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        <div className="w-full max-w-sm space-y-10 relative z-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-white">WELCOME BACK</h2>
            <p className="text-sm text-white/50">Sign in to continue your Winter Arc.</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 p-3 border border-red-400/20">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs tracking-wider uppercase text-white/50">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs tracking-wider uppercase text-white/50">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button 
                type="submit" 
                disabled={loading}
                className="text-xs tracking-[0.2em] uppercase text-white/80 hover:text-white transition-colors flex items-center gap-2 border-b border-transparent hover:border-white pb-1"
              >
                {loading ? "AUTHENTICATING..." : "LOGIN →"}
              </button>
              <Link href="/forgot-password" className="text-[10px] tracking-wider uppercase text-white/40 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="pt-16 text-[10px] text-white/30 text-center space-x-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  )
}
