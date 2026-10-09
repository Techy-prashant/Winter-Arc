'use client'

import React, { useState } from 'react'
import { submitDailyCheckIn } from './actions'
import { Info, Image as ImageIcon, Video, UploadCloud } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'

export function CheckInForm({ initialData }: { initialData?: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  
  const [physCompleted, setPhysCompleted] = useState(initialData?.physical_activity_completed || false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      // 1. Upload files directly from browser to Supabase to bypass Vercel limits
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const today = new Date().toISOString().split('T')[0]
      const studyFile = formData.get('study_proof') as File | null
      const physFile = formData.get('physical_proof') as File | null

      if (studyFile && studyFile.size > 0) {
        const ext = studyFile.name.split('.').pop()
        const filename = `${user.id}/${today}-study.${ext}`
        const { error } = await supabase.storage.from('proofs').upload(filename, studyFile, { upsert: true })
        if (error) throw new Error('Study proof upload failed: ' + error.message)
        formData.append('study_proof_url', `/api/media?bucket=proofs&path=${encodeURIComponent(filename)}`)
      }

      if (physFile && physFile.size > 0) {
        const ext = physFile.name.split('.').pop()
        const filename = `${user.id}/${today}-physical.${ext}`
        const { error } = await supabase.storage.from('proofs').upload(filename, physFile, { upsert: true })
        if (error) throw new Error('Physical proof upload failed: ' + error.message)
        formData.append('physical_proof_url', `/api/media?bucket=proofs&path=${encodeURIComponent(filename)}`)
      }

      // 2. Send the fast URL payload to the Server Action
      startTransition(async () => {
        try {
          const result = await submitDailyCheckIn(formData)
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
      })
    } catch (err: any) {
      setError(err.message || 'File upload failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-center gap-3">
          <Info className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 flex items-center gap-3">
          <Info className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Guidelines Section (For the upcoming Reference Images) */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Info className="w-4 h-4 text-white/50" />
          <h2 className="text-xs tracking-[0.2em] uppercase text-white/80 font-medium">Upload Guidelines & Reference</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/70">What to upload?</h3>
            <ul className="text-xs text-white/50 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <ImageIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span><strong>Photos:</strong> Any aspect ratio is allowed. Please ensure the resolution is 1080p or lower to keep uploads fast.</span>
              </li>
              <li className="flex items-start gap-2">
                <Video className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span><strong>Videos:</strong> Maximum duration of 60 seconds. Resolution limited to 1080p. Keep files compressed if possible.</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/70">Reference Examples</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-video bg-black/40 rounded border border-white/10 overflow-hidden relative group">
                <img src="/reference-upload/study-ref.png" alt="Study Reference" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition-opacity">Study Ref</div>
              </div>
              <div className="aspect-video bg-black/40 rounded border border-white/10 overflow-hidden relative group">
                <img src="/reference-upload/workout-ref.png" alt="Workout Reference" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition-opacity">Workout Ref</div>
              </div>
              <div className="aspect-video bg-black/40 rounded border border-white/10 overflow-hidden relative group">
                <video src="https://raw.githubusercontent.com/Techy-prashant/images_workIITM/main/WhatsApp%20Video%202026-10-08%20at%2011.06.27.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition-opacity">Video Ref</div>
              </div>
            </div>
            <p className="text-[10px] text-white/40 italic mt-2">Reference examples for Study and Physical proofs.</p>
          </div>
        </div>
      </div>

      {/* Study Section */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-8">
        <h2 className="text-[15px] tracking-[0.2em] uppercase text-white/80 border-b border-white/20 pb-1 flex items-center gap-2">
          STUDY GOAL
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label htmlFor="study_hours" className="text-xs tracking-wider uppercase text-white/60 font-medium">Study Hours</label>
            <input
              id="study_hours"
              name="study_hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              defaultValue={initialData ? (initialData.study_duration_minutes / 60) : ''}
              placeholder="0.0"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
              required
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="study_proof" className="text-xs tracking-wider uppercase text-white/60 font-medium">Proof Upload</label>
            <div className="relative">
              <input 
                id="study_proof" 
                name="study_proof" 
                type="file" 
                accept="image/*,video/*"
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white/50 text-sm file:bg-white/10 file:text-white file:border-0 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:text-[10px] file:uppercase tracking-wider file:font-medium hover:file:bg-white/20 transition-all cursor-pointer" 
              />
              <UploadCloud className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
            <p className="text-[10px] text-white/40 leading-tight">
              Max 60s video or image. Max 1080p resolution.
            </p>
            {initialData?.study_proof_url && (
              <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-medium">
                ✓ Proof already on file
              </p>
            )}
          </div>

          <div className="space-y-3 md:col-span-2">
            <label htmlFor="study_description" className="text-xs tracking-wider uppercase text-white/60 font-medium">What did you work on?</label>
            <textarea
              id="study_description"
              name="study_description"
              defaultValue={initialData?.study_description || ''}
              placeholder="Be specific about the tasks you completed."
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-sm min-h-[100px] focus:outline-none focus:border-white/40 transition-colors resize-none placeholder:text-white/20"
              required
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <label htmlFor="study_learned" className="text-xs tracking-wider uppercase text-white/60 font-medium">What did you learn?</label>
            <textarea
              id="study_learned"
              name="study_learned"
              defaultValue={initialData?.study_learned || ''}
              placeholder="Share your key takeaways."
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-sm min-h-[100px] focus:outline-none focus:border-white/40 transition-colors resize-none placeholder:text-white/20"
              required
            />
          </div>
        </div>
      </div>

      {/* Physical Activity Section */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-8">
        <h2 className="text-[15px] tracking-[0.2em] uppercase text-white/80 border-b border-white/20 pb-1 flex items-center gap-2">
          PHYSICAL TRAINING
        </h2>
        
        <div className="space-y-8">
          <label className="flex items-center space-x-4 cursor-pointer p-4 bg-black/20 border border-white/5 rounded-lg hover:bg-black/40 transition-colors">
            <input 
              type="checkbox" 
              id="physical_activity_completed" 
              name="physical_activity_completed"
              checked={physCompleted}
              onChange={(e) => setPhysCompleted(e.target.checked)}
              className="appearance-none w-5 h-5 border border-white/20 rounded bg-transparent checked:bg-white checked:border-white transition-colors relative cursor-pointer after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[6px] after:h-[11px] after:border-r-[2px] after:border-b-[2px] after:border-black after:rotate-45"
            />
            <span className="text-sm tracking-widest uppercase text-white/80 font-medium">
              I completed physical activity today
            </span>
          </label>

          {physCompleted && (
            <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="space-y-3">
                <label htmlFor="physical_activity_type" className="text-xs tracking-wider uppercase text-white/60 font-medium">Activity Type</label>
                <input
                  id="physical_activity_type"
                  name="physical_activity_type"
                  defaultValue={initialData?.physical_activity_type || ''}
                  placeholder="e.g. Weightlifting, Running"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
                  required={physCompleted}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="physical_activity_duration" className="text-xs tracking-wider uppercase text-white/60 font-medium">Duration (min)</label>
                <input
                  id="physical_activity_duration"
                  name="physical_activity_duration"
                  type="number"
                  min="1"
                  defaultValue={initialData?.physical_activity_duration_minutes || ''}
                  placeholder="60"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
                  required={physCompleted}
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label htmlFor="physical_proof" className="text-xs tracking-wider uppercase text-white/60 font-medium">Proof Upload</label>
                <div className="relative">
                  <input 
                    id="physical_proof" 
                    name="physical_proof" 
                    type="file" 
                    accept="image/*,video/*"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white/50 text-sm file:bg-white/10 file:text-white file:border-0 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:text-[10px] file:uppercase tracking-wider file:font-medium hover:file:bg-white/20 transition-all cursor-pointer" 
                  />
                  <UploadCloud className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
                <p className="text-[10px] text-white/40 leading-tight">
                  Max 60s video or image. Max 1080p resolution.
                </p>
                {initialData?.physical_activity_proof_url && (
                  <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-medium mt-1">
                    ✓ Proof already on file
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto px-8 py-4 bg-white text-black hover:bg-white/90 disabled:bg-white/50 disabled:cursor-not-allowed rounded-xl text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2"
        >
          {loading ? "COMMITTING..." : "COMMIT GOAL →"}
        </button>
      </div>
    </form>
  )
}
