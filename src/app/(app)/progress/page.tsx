import { createClient } from '@/utils/supabase/server'
import { ChallengeForm } from './ChallengeForm'

export default async function ChallengesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: challenges } = await supabase
    .from('weekly_challenges')
    .select('*')
    .order('start_date', { ascending: false })

  const { data: submissions } = await supabase
    .from('challenge_submissions')
    .select('challenge_id, proof_url, text_response')
    .eq('user_id', user.id)

  const submittedChallengeIds = new Set(submissions?.map(s => s.challenge_id) || [])
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-16 pb-20 md:pb-0 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <header className="border-b border-white/5 pb-8">
        <div className="text-xs tracking-[0.2em] font-medium uppercase text-white/50 mb-2">
          WEEKLY MISSIONS
        </div>
        <h1 className="text-4xl font-medium tracking-tight text-white uppercase">
          Missions
        </h1>
        <p className="text-xs tracking-widest text-white/40 mt-4 uppercase">
          Special directives from HQ.
        </p>
      </header>

      <div className="space-y-12">
        {challenges?.length === 0 && (
          <div className="text-center text-[10px] tracking-widest text-white/30 uppercase py-12">
            No challenges available.
          </div>
        )}

        {challenges?.map((challenge) => {
          const isCompleted = submittedChallengeIds.has(challenge.id)
          const isUpcoming = challenge.start_date > today
          const isActive = !isUpcoming && challenge.end_date >= today
          const isPast = challenge.end_date < today

          const end = new Date(challenge.end_date)
          const now = new Date(today)
          const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24)))

          return (
            <div key={challenge.id} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6 group">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <h2 className={`text-xl font-medium tracking-tight uppercase ${isActive && !isCompleted ? 'text-white' : 'text-white/60'}`}>
                      {challenge.title}
                    </h2>
                    {isActive && !isCompleted && (
                      <span className="text-[10px] tracking-widest uppercase text-black bg-white px-2 py-0.5">
                        Active
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] tracking-widest uppercase text-emerald-500 border border-emerald-500/30 px-2 py-0.5">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed font-light max-w-2xl whitespace-pre-wrap">
                    {challenge.description}
                  </p>
                </div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/40 shrink-0 md:text-right bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                  {isActive ? `${daysLeft} DAYS LEFT` : isUpcoming ? `STARTS ${challenge.start_date}` : 'CLOSED'}
                </div>
              </div>
              
              {isActive && (
                <ChallengeForm challengeId={challenge.id} hasSubmitted={isCompleted} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
