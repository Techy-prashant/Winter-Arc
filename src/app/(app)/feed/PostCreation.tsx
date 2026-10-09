'use client'

import { useState } from 'react'
import { createPost } from './actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function PostCreation({ currentUser }: { currentUser: { id: string, avatar_url?: string, username?: string } }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await createPost(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        // Reset form
        (e.target as HTMLFormElement).reset()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-8">
      {error && (
        <div className="mb-4 text-xs text-red-400 border-b border-red-400/20 pb-2">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-6">
        <Avatar className="h-10 w-10 rounded-full border border-white/10 shrink-0">
          <AvatarImage src={currentUser.avatar_url} />
          <AvatarFallback className="bg-transparent text-xs text-white/50 rounded-full">
            {currentUser.username?.substring(0,2).toUpperCase() || 'US'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <textarea 
            name="content"
            className="w-full bg-transparent border-none text-white resize-none focus:outline-none focus:ring-0 px-0 placeholder:text-white/20 min-h-[60px] text-sm" 
            placeholder="Share your progress or thoughts..."
            required
          />
          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <div className="relative cursor-pointer flex items-center group">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 group-hover:text-white transition-colors">Attach Media</span>
              <input type="file" name="media" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,video/*" />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="text-[10px] tracking-[0.2em] uppercase text-white/80 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
            >
              {loading ? 'POSTING...' : 'POST →'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
