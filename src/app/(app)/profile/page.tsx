import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: streak } = await supabase
    .from('streaks_progress')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: recentActivity } = await supabase
    .from('daily_check_ins')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-16 pb-20 md:pb-0 animate-in fade-in duration-700 max-w-4xl mx-auto">
      
      {/* Profile Header */}
      <header className="border-b border-white/5 pb-12 flex flex-col md:flex-row items-center md:items-start gap-8">
        <Avatar className="h-32 w-32 rounded-full border border-white/10 shrink-0">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-transparent text-white/50 text-2xl font-light rounded-full">
            {profile?.username?.substring(0,2).toUpperCase() || 'US'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <h1 className="text-4xl font-medium tracking-tight text-white uppercase">{profile?.username || 'Soldier'}</h1>
              <a href="/profile/edit" className="text-xs tracking-widest text-white/40 hover:text-white uppercase border border-white/20 px-3 py-1 transition-colors">Edit</a>
            </div>
            <p className="text-xs tracking-[0.2em] uppercase text-white/50 mt-2">{profile?.working_on || 'Currently on the grind.'}</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
            <div className="text-xs tracking-[0.2em] uppercase text-white/80 border-b border-white/20 pb-1">
              {streak?.current_streak || 0} Day Streak
            </div>
            <div className="text-xs tracking-[0.2em] uppercase text-white/40">
              Score: {streak?.leaderboard_score || 0}
            </div>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-12 gap-16">
        
        {/* Left Column: Stats & Goals */}
        <div className="md:col-span-5 p-6 rounded-xl bg-white/5 border border-white/10 space-y-12 h-fit">
          
          <div className="space-y-4">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-white/40 border-b border-white/5 pb-2">
              THE WINTER GOAL
            </h2>
            <p className="text-sm text-white/80 leading-relaxed font-light">
              {profile?.winter_goal || 'No winter goal defined.'}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-white/40 border-b border-white/5 pb-2">
              CONSISTENCY
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs tracking-widest uppercase text-white/60">Study</span>
                <span className="text-sm text-white">{Math.floor((streak?.total_study_minutes || 0)/60)} hrs</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs tracking-widest uppercase text-white/60">Fitness</span>
                <span className="text-sm text-white">{streak?.total_workouts || 0} sessions</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Recent Activity */}
        <div className="md:col-span-7 p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-white/40 border-b border-white/20 pb-2">
            RECENT ACTIVITY
          </h2>
          
          <div className="space-y-8 pt-4">
            {recentActivity?.length === 0 && (
              <p className="text-[10px] tracking-widest uppercase text-white/30 text-center py-12">No activity logged.</p>
            )}
            
            {recentActivity?.map((activity) => (
              <div key={activity.id} className="relative pl-6 border-l border-white/10 group hover:border-white/30 transition-colors">
                <div className="absolute w-[5px] h-[5px] bg-white/30 rounded-full -left-[3px] top-1.5 group-hover:bg-white transition-colors" />
                
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">{activity.date}</p>
                  
                  <div className="text-sm text-white/90">
                    Studied {Math.floor(activity.study_duration_minutes / 60)}h {activity.study_duration_minutes % 60}m.
                    {activity.physical_activity_completed && ' Physical training completed.'}
                  </div>
                  
                  {activity.study_description && (
                    <p className="text-xs text-white/50 italic leading-relaxed pt-2">
                      "{activity.study_description}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
