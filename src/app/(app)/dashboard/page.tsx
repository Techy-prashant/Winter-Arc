import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch Profile & Streak
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, working_on, current_study_hours, target_study_hours, winter_goal')
    .eq('id', user.id)
    .single()

  const { data: streak } = await supabase
    .from('streaks_progress')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch Today's Check-in
  const today = new Date().toISOString().split('T')[0]
  const { data: checkIn } = await supabase
    .from('daily_check_ins')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Greeting Logic
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING'

  // Safety fallbacks
  const currentStreak = streak?.current_streak || 0
  const longestStreak = streak?.longest_streak || 0
  const targetHours = profile?.target_study_hours || 1
  const todayStudyMinutes = checkIn?.study_duration_minutes || 0
  const todayWorkoutDone = checkIn?.physical_activity_completed || false

  const studyProgress = Math.min((todayStudyMinutes / (targetHours * 60)) * 100, 100)

  return (
    <div className="space-y-16 pb-20 md:pb-0 animate-in fade-in duration-700">
      <header className="border-b border-white/5 pb-8">
        <div className="text-xs tracking-[0.2em] font-medium uppercase text-white/50 mb-2">
          {greeting}, {profile?.username || 'SOLDIER'}
        </div>
        <h1 className="text-4xl font-medium tracking-tight text-white uppercase">
          Your Arc
        </h1>
      </header>

      <div className="grid md:grid-cols-2 gap-16">

        {/* Left Column: Streaks */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-[15px] tracking-[0.2em] uppercase text-white/80 border-b border-white/20 pb-2">
              CURRENT STREAK
            </h2>
            <div className="flex items-baseline space-x-3">
              <span className="text-8xl font-light tracking-tighter text-white">
                {currentStreak}
              </span>
              <span className="text-xs tracking-[0.2em] uppercase text-white/30">DAYS</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[15px] tracking-[0.2em] uppercase text-white/80 border-b border-white/20 pb-2">
              LONGEST STREAK
            </h2>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-light tracking-tighter text-white/70">
                {longestStreak}
              </span>
              <span className="text-xs tracking-[0.2em] uppercase text-white/30">DAYS</span>
            </div>
          </div>

        </div>

        {/* Right Column: Today's Goal */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-12">

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <h2 className="text-[15px] tracking-[0.2em] uppercase text-white/80">TODAY</h2>
              <span className="text-[15px] tracking-[0.2em] uppercase text-white/60">{today}</span>
            </div>

            <div className="space-y-8">

              {/* Study */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm uppercase tracking-widest text-white/80">Study</span>
                  <span className="text-[10px] tracking-wider text-white uppercase">
                    {Math.floor(todayStudyMinutes / 60)}h {todayStudyMinutes % 60}m / {targetHours}h
                  </span>
                </div>
                <div className="h-[1px] w-full bg-white/5 relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-white/40 transition-all duration-1000" 
                    style={{ width: `${studyProgress}%` }}
                  />
                </div>
              </div>

              {/* Physical */}
              <div className="flex justify-between items-center">
                <span className="text-sm uppercase tracking-widest text-white/80">Physical Activity</span>
                {todayWorkoutDone ? (
                  <span className="text-[10px] tracking-wider text-emerald-500 uppercase">Completed</span>
                ) : (
                  <span className="text-[10px] tracking-wider text-white/50 uppercase">Pending</span>
                )}
              </div>
              
              {/* Challenge */}
              <div className="flex justify-between items-center">
                <span className="text-sm uppercase tracking-widest text-white/80">Weekly Challenge</span>
                <span className="text-[10px] tracking-wider text-white/50 uppercase">Check</span>
              </div>
            </div>
            
            <div className="pt-8">
              <Link href="/check-in" className="inline-block text-xs tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
                {checkIn ? 'UPDATE CHECK-IN →' : 'LOG ACTIVITY →'}
              </Link>
            </div>
            
          </div>
          
        </div>
      </div>
      
    </div>
  )
}
