'use client'

import { useState } from 'react'
import { updateProfile } from './actions'
import { Camera } from 'lucide-react'
import Image from 'next/image'

export default function EditProfilePage({ profile }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    try {
      const result = await updateProfile(formData)
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="border-b border-white/5 pb-8">
        <h1 className="text-3xl font-medium tracking-tight text-white uppercase">EDIT DOSSIER</h1>
        <p className="text-xs tracking-[0.2em] uppercase text-white/50 mt-2">Update your operational profile.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="text-[10px] uppercase tracking-wider text-red-400 border-b border-red-400/20 pb-2">
            {error}
          </div>
        )}

        <div className="flex justify-center md:justify-start">
          <div className="relative group cursor-pointer">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-black/40">
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-light">
                  {profile?.username?.substring(0,2).toUpperCase() || 'US'}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input 
              type="file" 
              name="avatar" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Username</label>
            <input
              name="username"
              type="text"
              defaultValue={profile?.username || ''}
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Full Name</label>
            <input
              name="full_name"
              type="text"
              defaultValue={profile?.full_name || ''}
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Current Mission / Working On</label>
            <input
              name="working_on"
              type="text"
              defaultValue={profile?.working_on || ''}
              placeholder="e.g. Preparing for exams, Building a startup"
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Winter Arc Goal (Detailed)</label>
            <textarea
              name="winter_goal"
              defaultValue={profile?.winter_goal || ''}
              rows={4}
              placeholder="What exactly are you going to achieve in these 90 days?"
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors resize-none"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 text-xs tracking-[0.2em] uppercase text-black bg-white py-4 hover:bg-white/90 transition-colors"
          >
            {loading ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </form>
    </div>
  )
}
