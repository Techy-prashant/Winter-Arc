import { Loader2 } from 'lucide-react'

export default function AppLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 blur-xl bg-white/20 rounded-full animate-pulse" />
        <Loader2 className="w-8 h-8 text-white/70 animate-spin relative z-10" />
      </div>
      <div className="flex flex-col items-center space-y-1">
        <p className="text-xs tracking-[0.3em] font-medium uppercase text-white/50">
          Syncing
        </p>
        <p className="text-[10px] text-white/30 italic">
          Loading your Winter Arc data...
        </p>
      </div>
    </div>
  )
}
