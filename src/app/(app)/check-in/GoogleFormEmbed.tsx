import React from 'react'
import { ExternalLink, ClipboardCheck, AlertCircle } from 'lucide-react'

export function GoogleFormEmbed() {
  const formUrl = "https://forms.gle/LoRn336HyYut8FbH9"

  return (
    <div className="p-8 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg tracking-widest uppercase text-white font-medium">
              Daily Check-In
            </h2>
          </div>
          
          <p className="text-sm text-white/60 leading-relaxed max-w-xl">
            Submit your daily Winter Arc progress honestly. Record your study hours, workouts, and upload proof. Consistent check-ins build unbreakable habits.
          </p>

          <div className="flex items-center gap-2 text-xs text-amber-500/80 bg-amber-500/10 w-fit px-3 py-1.5 rounded-md border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Requires Google Sign-in for image uploads.</span>
          </div>
        </div>

        <a 
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-lg font-medium tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/20"
        >
          <span>Open Form</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
