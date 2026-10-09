import { createClient, createAdminClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminSupabase = createAdminClient()
  const { data: leaderboardRaw } = await adminSupabase
    .from('streaks_progress')
    .select(`
      user_id,
      current_streak,
      longest_streak,
      leaderboard_score,
      total_study_minutes,
      total_workouts,
      profiles (
        username,
        avatar_url
      )
    `)
    .order('leaderboard_score', { ascending: false })
    .limit(100)

  const leaderboardData = leaderboardRaw?.map((row, index) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    return {
      id: row.user_id,
      name: profile?.username || 'Unknown',
      avatar: profile?.avatar_url,
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      score: row.leaderboard_score,
      studyHours: Math.floor(row.total_study_minutes / 60),
      workouts: row.total_workouts,
      rank: index + 1,
      isCurrentUser: row.user_id === user.id
    }
  }) || []

  return (
    <div className="space-y-12 pb-20 md:pb-0 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <header className="border-b border-white/5 pb-8 flex justify-between items-end">
        <div>
          <div className="text-xs tracking-[0.2em] font-medium uppercase text-white/50 mb-2">
            RANKINGS
          </div>
          <h1 className="text-4xl font-medium tracking-tight text-white uppercase">
            The Consistent
          </h1>
        </div>
      </header>

      <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="grid grid-cols-12 gap-4 px-4 pb-4 border-b border-white/20 text-[10px] tracking-[0.2em] uppercase text-white/40">
          <div className="col-span-1 text-center">RK</div>
          <div className="col-span-4">Participant</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-right">C.Streak</div>
          <div className="col-span-3 text-right">Best</div>
        </div>

        <div className="space-y-2">
          {leaderboardData.map((p) => (
            <div 
              key={p.id} 
              className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-lg items-center text-sm transition-colors ${
                p.isCurrentUser ? 'bg-white/10' : 'hover:bg-white/[0.05]'
              }`}
            >
              <div className="col-span-1 text-center text-white/50 text-xs">
                {p.rank < 10 ? `0${p.rank}` : p.rank}
              </div>
              
              <div className="col-span-4 flex items-center space-x-4">
                <Avatar className="h-6 w-6 rounded-full border border-white/10">
                  <AvatarImage src={p.avatar} />
                  <AvatarFallback className="bg-transparent text-[10px] text-white/50 rounded-full">
                    {p.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={`tracking-wider uppercase text-xs ${p.isCurrentUser ? 'text-white font-medium' : 'text-white/70'}`}>
                  {p.name}
                </span>
              </div>

              <div className="col-span-2 text-right text-xs tracking-wider text-white">
                {p.score}
              </div>
              
              <div className="col-span-2 text-right text-xs tracking-wider text-white/70">
                {p.currentStreak}
              </div>

              <div className="col-span-3 text-right text-xs tracking-wider text-white/40">
                {p.longestStreak}
              </div>
            </div>
          ))}

          {leaderboardData.length === 0 && (
            <div className="text-center text-[10px] tracking-widest text-white/30 uppercase py-12">
              No participants ranked
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
