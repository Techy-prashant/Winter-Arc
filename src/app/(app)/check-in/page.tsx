import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CheckInForm } from './CheckInForm'
import { TargetsBoard } from '../dashboard/TargetsBoard'

export default async function CheckInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]
  const { data: existingCheckIn } = await supabase
    .from('daily_check_ins')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const { data: targets } = await supabase
    .from('daily_targets')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-16 pb-20 md:pb-0 animate-in fade-in duration-700 max-w-2xl mx-auto">
      <header className="border-b border-white/20 pb-8">
        <div className="text-xs tracking-[0.2em] font-medium uppercase text-white/60 mb-2">
          {today}
        </div>
        <h1 className="text-4xl font-medium tracking-tight text-white uppercase">
          Daily Goal
        </h1>
        {existingCheckIn && (
          <div className="mt-6 text-[10px] tracking-[0.2em] uppercase text-emerald-500/80">
            Activity logged. Submitting again will overwrite.
          </div>
        )}
      </header>

      <TargetsBoard initialTargets={targets || []} />

      <div className="pt-8 border-t border-white/5">
        <CheckInForm initialData={existingCheckIn} />
      </div>
    </div>
  )
}
