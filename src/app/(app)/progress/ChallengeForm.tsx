'use client'

import { useState } from 'react'
import { submitChallenge } from './actions'

export function ChallengeForm({ challengeId, hasSubmitted }: { challengeId: string, hasSubmitted: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('challenge_id', challengeId)
    
    try {
      const result = await submitChallenge(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.success)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success || hasSubmitted) {
    return null // Hidden because we show "Completed" badge on the challenge header
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-6">
      {error && (
        <div className="text-xs text-red-400 border-b border-red-400/20 pb-2">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="text_response" className="text-xs tracking-wider uppercase text-white/60">Response</label>
        <textarea 
          id="text_response" 
          name="text_response" 
          placeholder="Enter your reflection or answer here..."
          className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-white min-h-[80px] focus:outline-none focus:border-white transition-colors resize-none text-sm"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="proof_file" className="text-xs tracking-wider uppercase text-white/60">Media Upload</label>
        <input 
          id="proof_file" 
          name="proof_file" 
          type="file" 
          accept="image/*,video/*"
          className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-white/50 file:bg-white/10 file:text-white file:border-0 file:mr-4 file:py-1 file:px-3 file:text-[10px] file:uppercase tracking-wider file:font-medium" 
        />
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="text-xs tracking-[0.2em] uppercase text-white/80 hover:text-white transition-colors flex items-center gap-2 border-b border-transparent hover:border-white pb-1"
        >
          {loading ? "SUBMITTING..." : "SUBMIT RESPONSE →"}
        </button>
      </div>
    </form>
  )
}
