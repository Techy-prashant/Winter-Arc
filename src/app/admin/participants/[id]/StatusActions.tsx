'use client'

import { useState } from 'react'
import { setParticipantStatus } from './actions'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ShieldX, CheckCircle } from 'lucide-react'

export function StatusActions({ userId, currentStatus }: { userId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(status: 'active' | 'suspended' | 'at-risk') {
    if (status === 'suspended' && !confirm('Are you sure you want to suspend this participant?')) return
    
    setLoading(true)
    await setParticipantStatus(userId, status)
    setLoading(false)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {currentStatus !== 'active' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleStatusChange('active')} 
          disabled={loading}
          className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
        >
          <CheckCircle className="w-4 h-4 mr-2" /> Restore Active
        </Button>
      )}
      
      {currentStatus !== 'at-risk' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleStatusChange('at-risk')} 
          disabled={loading}
          className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-red-400"
        >
          <AlertTriangle className="w-4 h-4 mr-2" /> Flag At-Risk
        </Button>
      )}

      {currentStatus !== 'suspended' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleStatusChange('suspended')} 
          disabled={loading}
          className="border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white"
        >
          <ShieldX className="w-4 h-4 mr-2" /> Suspend
        </Button>
      )}
    </div>
  )
}
