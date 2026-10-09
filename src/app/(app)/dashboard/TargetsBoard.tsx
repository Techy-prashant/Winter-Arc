'use client'

import { useState, useEffect } from 'react'
import { addTarget, toggleTarget, deleteTarget } from './actions'
import { Check, X, Clock, Plus, Target } from 'lucide-react'

function MidnightTimer() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      
      const diff = midnight.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeLeft('00:00:00')
        return
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / 1000 / 60) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center space-x-2 text-xs tracking-widest text-red-400 font-mono bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
      <Clock className="w-3 h-3" />
      <span>{timeLeft || '00:00:00'}</span>
    </div>
  )
}

export function TargetsBoard({ initialTargets }: { initialTargets: any[] }) {
  const [targets, setTargets] = useState(initialTargets)
  const [addingMain, setAddingMain] = useState(false)
  const [addingSide, setAddingSide] = useState(false)
  
  useEffect(() => {
    setTargets(initialTargets)
  }, [initialTargets])
  
  const mainTargets = targets.filter(t => t.is_main_target)
  const sideQuests = targets.filter(t => !t.is_main_target)
  
  const mainCompleted = mainTargets.filter(t => t.completed).length
  const totalCompleted = targets.filter(t => t.completed).length
  const total = targets.length
  
  const progressPercent = total === 0 ? 0 : Math.round((totalCompleted / total) * 100)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>, isMain: boolean) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.append('is_main_target', isMain.toString())
    
    // Optimistic Add (temporary ID)
    const title = formData.get('title') as string
    const tempTarget = {
      id: Math.random().toString(),
      title,
      is_main_target: isMain,
      completed: false
    }
    setTargets(prev => [...prev, tempTarget])
    form.reset()
    setAddingMain(false)
    setAddingSide(false)
    
    await addTarget(formData)
  }

  async function handleToggle(id: string, currentCompleted: boolean) {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, completed: !currentCompleted } : t))
    await toggleTarget(id, !currentCompleted)
  }

  async function handleDelete(id: string) {
    setTargets(prev => prev.filter(t => t.id !== id))
    await deleteTarget(id)
  }

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-12 animate-in fade-in duration-700 delay-150 fill-mode-both">
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div>
          <h2 className="text-[15px] tracking-[0.2em] uppercase text-white/80 font-medium flex items-center gap-2">
            <Target className="w-4 h-4" /> TIME MANAGEMENT
          </h2>
          <p className="text-[10px] tracking-wider uppercase text-white/40 mt-2">
            Complete the Rule of 3 to secure victory.
          </p>
        </div>
        <MidnightTimer />
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Left: Targets List */}
        <div className="flex-1 space-y-8">
          
          {/* MAIN TARGETS */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="text-xs tracking-[0.2em] uppercase text-white/60">Main Targets (Rule of 3)</h3>
              <span className="text-[10px] tracking-widest text-emerald-500">{mainCompleted}/3</span>
            </div>
            
            <div className="space-y-3">
              {mainTargets.map(t => (
                <div key={t.id} className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${t.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/40 border-white/10 hover:border-white/30'}`}>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleToggle(t.id, t.completed)} className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${t.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/30 text-transparent hover:border-white'}`}>
                      <Check className="w-3 h-3" />
                    </button>
                    <span className={`text-sm tracking-wide ${t.completed ? 'text-emerald-500/80 line-through' : 'text-white/90'}`}>
                      {t.title}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {mainTargets.length < 3 && !addingMain && (
                <button onClick={() => setAddingMain(true)} className="w-full p-4 rounded-xl border border-dashed border-white/20 text-white/40 text-xs tracking-wider uppercase hover:border-white/50 hover:text-white transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Main Target
                </button>
              )}
              {addingMain && (
                <form onSubmit={(e) => handleAdd(e, true)} className="flex gap-2">
                  <input autoFocus name="title" required placeholder="State your objective..." className="flex-1 bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                  <button type="submit" className="px-6 rounded-lg bg-white text-black text-xs tracking-widest uppercase font-bold hover:bg-white/90">Add</button>
                  <button type="button" onClick={() => setAddingMain(false)} className="px-4 text-white/50 hover:text-white"><X className="w-4 h-4"/></button>
                </form>
              )}
            </div>
          </div>

          {/* SIDE QUESTS */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-xs tracking-[0.2em] uppercase text-white/40">Side Quests</h3>
            <div className="space-y-2">
              {sideQuests.map(t => (
                <div key={t.id} className="group flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggle(t.id, t.completed)} className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-colors ${t.completed ? 'bg-white/20 border-transparent text-white' : 'border-white/20 text-transparent hover:border-white/50'}`}>
                      <Check className="w-3 h-3" />
                    </button>
                    <span className={`text-xs ${t.completed ? 'text-white/30 line-through' : 'text-white/60'}`}>
                      {t.title}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {!addingSide ? (
                <button onClick={() => setAddingSide(true)} className="text-[10px] tracking-widest uppercase text-white/30 hover:text-white transition-colors flex items-center gap-1 pt-2">
                  <Plus className="w-3 h-3" /> Add side quest
                </button>
              ) : (
                <form onSubmit={(e) => handleAdd(e, false)} className="flex gap-2 pt-2">
                  <input autoFocus name="title" required placeholder="Minor task..." className="flex-1 bg-transparent border-b border-white/20 px-2 py-1 text-xs text-white focus:outline-none focus:border-white" />
                  <button type="submit" className="text-[10px] uppercase text-emerald-500">Save</button>
                  <button type="button" onClick={() => setAddingSide(false)} className="text-[10px] uppercase text-white/40"><X className="w-3 h-3"/></button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Right: Progress Heatmap Ring */}
        <div className="w-full md:w-48 shrink-0 flex flex-col items-center justify-center space-y-6 bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
              {/* Progress ring */}
              <circle 
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={364.4} 
                strokeDashoffset={364.4 - (364.4 * progressPercent) / 100}
                className={`transition-all duration-1000 ease-out ${progressPercent === 100 ? 'text-emerald-500' : 'text-white'}`} 
              />
            </svg>
            <div className="text-center flex flex-col items-center justify-center">
              <span className={`text-3xl font-light tracking-tighter ${progressPercent === 100 ? 'text-emerald-500' : 'text-white'}`}>
                {progressPercent}%
              </span>
              <span className="text-[8px] tracking-[0.2em] uppercase text-white/40 mt-1">COMPLETED</span>
            </div>
          </div>
          {progressPercent === 100 && total > 0 && (
            <div className="text-[10px] tracking-widest uppercase text-emerald-500 animate-pulse font-medium text-center">
              Target Acquired
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
