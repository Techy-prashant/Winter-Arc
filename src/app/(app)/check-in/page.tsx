import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TargetsBoard } from '../dashboard/TargetsBoard'
import { StudyTimer } from './StudyTimer'
import { ReferenceImages } from './ReferenceImages'
import { GoogleFormEmbed } from './GoogleFormEmbed'

export default async function CheckInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]

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
      </header>

      {/* TASK MANAGEMENT */}
      <section>
        <TargetsBoard initialTargets={targets || []} />
      </section>

      {/* STUDY TIMER */}
      <section>
        <StudyTimer />
      </section>

      {/* DAILY CHECK-IN (GOOGLE FORM) */}
      <section className="space-y-8">
        <ReferenceImages />
        <GoogleFormEmbed />
      </section>
    </div>
  )
}
