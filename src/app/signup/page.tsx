'use client'

import { useState } from 'react'
import { signup } from './actions'
import Link from 'next/link'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    try {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] text-gray-200">
      <div className="w-full max-w-sm px-6">
        
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.2em] font-medium uppercase text-white/50 mb-2">NAMDAPHA</div>
          <h1 className="text-3xl font-medium tracking-tight text-white uppercase">WINTER ARC</h1>
          <p className="text-[10px] tracking-widest uppercase text-white/30 mt-4">New Recruit Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="text-[10px] uppercase tracking-wider text-red-400 border-b border-red-400/20 pb-2 text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <input
              name="email"
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
              required
            />
            
            <input
              name="password"
              type="password"
              placeholder="PASSWORD"
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
              required
              minLength={6}
            />

            <input
              name="full_name"
              type="text"
              placeholder="FULL NAME"
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
              required
            />

            <input
              name="username"
              type="text"
              placeholder="USERNAME"
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
              required
            />
          </div>

          <div className="pt-4 space-y-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full text-xs tracking-[0.2em] uppercase text-black bg-white py-4 hover:bg-white/90 transition-colors"
            >
              {loading ? "INITIALIZING..." : "JOIN THE ARC"}
            </button>
            
            <div className="text-center">
              <Link href="/login" className="text-[10px] tracking-widest uppercase text-white/40 hover:text-white transition-colors">
                Already enlisted? Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
