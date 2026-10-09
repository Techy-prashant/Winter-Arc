'use client'

import { useState } from 'react'
import { completeOnboarding } from './actions'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [workingOn, setWorkingOn] = useState('')
  const [currentHours, setCurrentHours] = useState('')
  const [targetHours, setTargetHours] = useState('')
  const [winterGoal, setWinterGoal] = useState('')
  const [username, setUsername] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('working_on', workingOn)
    formData.append('current_study_hours', currentHours)
    formData.append('target_study_hours', targetHours)
    formData.append('winter_goal', winterGoal)
    formData.append('username', username)

    try {
      const result = await completeOnboarding(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleNext = () => setStep(prev => prev + 1)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] text-gray-200 relative overflow-hidden">
      
      {/* Noise overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      <div className="w-full max-w-2xl px-6 relative z-10">
        
        <div className="mb-12">
          <div className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">
            STEP {step} OF 5
          </div>
          <div className="w-full h-[1px] bg-white/5 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-white transition-all duration-500" 
              style={{ width: `${(step / 5) * 100}%` }} 
            />
          </div>
        </div>

        <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-12">
          
          {error && (
            <div className="text-xs text-red-400 border-b border-red-400/20 pb-2">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-2">
                <h1 className="text-3xl font-medium tracking-tight text-white uppercase">The Foundation</h1>
                <p className="text-sm text-white/50">What is your main focus? (e.g. JEE prep, learning DSA)</p>
              </div>
              <textarea 
                value={workingOn}
                onChange={e => setWorkingOn(e.target.value)}
                placeholder="I am currently focusing on..." 
                className="w-full bg-transparent border-b border-white/20 px-0 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-xl min-h-[120px] resize-none"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-2">
                <h1 className="text-3xl font-medium tracking-tight text-white uppercase">The Baseline</h1>
                <p className="text-sm text-white/50">How many hours are you actively studying right now?</p>
              </div>
              <input 
                type="number"
                min="0"
                max="24"
                value={currentHours}
                onChange={e => setCurrentHours(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent border-b border-white/20 px-0 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-4xl font-light"
                required
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-2">
                <h1 className="text-3xl font-medium tracking-tight text-white uppercase">The Standard</h1>
                <p className="text-sm text-white/50">What is the target daily study hours for this Winter Arc?</p>
              </div>
              <input 
                type="number"
                min="1"
                max="24"
                value={targetHours}
                onChange={e => setTargetHours(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent border-b border-white/20 px-0 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-4xl font-light"
                required
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-2">
                <h1 className="text-3xl font-medium tracking-tight text-white uppercase">The Arc</h1>
                <p className="text-sm text-white/50">Define your ultimate goal for the end of the Arc.</p>
              </div>
              <textarea 
                value={winterGoal}
                onChange={e => setWinterGoal(e.target.value)}
                placeholder="By the end of winter, I will have..." 
                className="w-full bg-transparent border-b border-white/20 px-0 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-xl min-h-[120px] resize-none"
                required
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-2">
                <h1 className="text-3xl font-medium tracking-tight text-white uppercase">Identity</h1>
                <p className="text-sm text-white/50">Choose a unique username to represent yourself.</p>
              </div>
              <input 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. shadow_worker" 
                className="w-full bg-transparent border-b border-white/20 px-0 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-xl"
                required
                minLength={3}
              />
            </div>
          )}

          <div className="pt-8">
            <button 
              type="submit" 
              disabled={loading}
              className="text-xs tracking-[0.2em] uppercase text-white hover:text-white transition-colors border-b border-white/20 hover:border-white pb-1"
            >
              {step < 5 ? "CONTINUE →" : (loading ? "INITIALIZING..." : "BEGIN ARC →")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
