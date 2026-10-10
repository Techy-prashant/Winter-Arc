'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, RotateCcw, Clock } from 'lucide-react'

export function StudyTimer() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  
  const accumulatedRef = useRef(0)
  const startTimeRef = useRef(0)

  useEffect(() => {
    // Restore from localStorage
    const savedState = localStorage.getItem('winterArcTimerState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed.isRunning) {
          const now = Date.now()
          const additionalElapsed = Math.floor((now - parsed.lastTick) / 1000)
          const totalElapsed = parsed.elapsed + additionalElapsed
          
          setElapsed(totalElapsed)
          accumulatedRef.current = parsed.elapsed
          startTimeRef.current = parsed.lastTick
          setIsRunning(true)
        } else {
          setElapsed(parsed.elapsed)
          accumulatedRef.current = parsed.elapsed
          setIsRunning(false)
        }
      } catch (e) {
        console.error("Failed to parse timer state")
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        const now = Date.now()
        const additionalElapsed = Math.floor((now - startTimeRef.current) / 1000)
        setElapsed(accumulatedRef.current + additionalElapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStartResume = () => {
    const now = Date.now()
    startTimeRef.current = now
    accumulatedRef.current = elapsed
    setIsRunning(true)
    localStorage.setItem('winterArcTimerState', JSON.stringify({
      isRunning: true,
      elapsed: elapsed,
      lastTick: now
    }))
  }

  const handlePause = () => {
    setIsRunning(false)
    const finalElapsed = accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
    setElapsed(finalElapsed)
    accumulatedRef.current = finalElapsed
    localStorage.setItem('winterArcTimerState', JSON.stringify({
      isRunning: false,
      elapsed: finalElapsed,
      lastTick: Date.now()
    }))
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsed(0)
    accumulatedRef.current = 0
    localStorage.removeItem('winterArcTimerState')
  }

  const handleStopSave = () => {
    setIsRunning(false)
    let finalElapsed = elapsed
    if (isRunning) {
      finalElapsed = accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
    }
    // For now we just reset it, we can display a success message or save to DB if needed
    // The requirement says "Stop and save session, if session recording is supported by the current architecture."
    alert(`Session completed: ${formatTime(finalElapsed)}`)
    setElapsed(0)
    accumulatedRef.current = 0
    localStorage.removeItem('winterArcTimerState')
  }

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
      <h2 className="text-[15px] tracking-[0.2em] uppercase text-white/80 border-b border-white/20 pb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" /> STUDY TIMER
      </h2>
      
      <div className="flex flex-col items-center justify-center space-y-8 py-8">
        <div className={`text-6xl md:text-8xl font-mono tracking-tighter ${isRunning ? 'text-emerald-500' : 'text-white'} transition-colors`}>
          {formatTime(elapsed)}
        </div>
        
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <button 
              onClick={handleStartResume}
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors"
              title={elapsed > 0 ? "Resume" : "Start"}
            >
              <Play className="w-6 h-6 ml-1" />
            </button>
          ) : (
            <button 
              onClick={handlePause}
              className="w-14 h-14 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              title="Pause"
            >
              <Pause className="w-6 h-6" />
            </button>
          )}

          <button 
            onClick={handleStopSave}
            disabled={elapsed === 0}
            className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Stop & Save"
          >
            <Square className="w-5 h-5" />
          </button>

          <button 
            onClick={handleReset}
            disabled={elapsed === 0 && !isRunning}
            className="w-14 h-14 rounded-full bg-white/5 text-white/50 border border-white/10 flex items-center justify-center hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
