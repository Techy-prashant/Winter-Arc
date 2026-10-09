import React from 'react'
import { Info, Image as ImageIcon, Video } from 'lucide-react'

export function ReferenceImages() {
  return (
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
  )
}
