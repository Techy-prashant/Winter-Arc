import React from 'react'
import { ExternalLink } from 'lucide-react'

export function GoogleFormEmbed() {
  // Using the embedded URL directly for better iframe support
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdLMSAMlaSBQmoC0uQZBzbH9pe-WlN25vHwRsfVAJMSuCWo3w/viewform?embedded=true"

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
      <div className="flex flex-col space-y-2 border-b border-white/20 pb-4">
        <h2 className="text-[15px] tracking-[0.2em] uppercase text-white/80 font-medium">
          DAILY CHECK-IN
        </h2>
        <p className="text-xs text-white/50">
          Submit your daily Winter Arc progress to update your record.
        </p>
      </div>
      
      <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
        <iframe 
          src={formUrl}
          className="w-full border-0"
          style={{ height: '3200px' }}
          title="Daily Check-In Form"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        >
          Loading…
        </iframe>
      </div>
      
      <div className="pt-2 flex justify-end">
        <a 
          href={formUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] tracking-widest uppercase text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          Open form in a new tab <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
