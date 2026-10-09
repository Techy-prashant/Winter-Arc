import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ShieldAlert, BookOpen, Dumbbell, Calendar, Target } from 'lucide-react'
import { StatusActions } from './StatusActions'
import Link from 'next/link'

export default async function ParticipantDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const userId = params.id
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      participant_registrations (registration_data, imported_at),
      goals (goal_text, category, created_at),
      streaks_progress (*),
      daily_check_ins (id, date, study_duration_minutes, physical_activity_completed, is_day_completed, study_proof_url, physical_activity_proof_url),
      challenge_submissions (proof_url, submitted_at, weekly_challenges (title))
    `)
    .eq('id', userId)
    .single()

  if (!profile) return <div className="p-8 text-destructive font-bold text-center mt-20">Participant not found.</div>

  const registrations = Array.isArray(profile.participant_registrations) ? profile.participant_registrations[0] : profile.participant_registrations
  const streaks = Array.isArray(profile.streaks_progress) ? profile.streaks_progress[0] : profile.streaks_progress

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-white/10">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-xl font-bold text-primary">
              {profile.username?.substring(0,2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-white">{profile.full_name}</h1>
              <Badge variant={profile.account_status === 'active' ? 'default' : profile.account_status === 'at-risk' ? 'destructive' : 'secondary'} className={profile.account_status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : ''}>
                {profile.account_status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono">@{profile.username} | {profile.email}</p>
          </div>
        </div>
        
        <StatusActions userId={userId} currentStatus={profile.account_status} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Stats */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-black/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center"><Target className="w-5 h-5 mr-2 text-primary" /> Accountability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-orange-500">{streaks?.current_streak || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase">Current Streak</div>
                </div>
                <div className="bg-white/5 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-white">{streaks?.longest_streak || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase">Best Streak</div>
                </div>
                <div className="bg-white/5 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-primary">{streaks?.leaderboard_score || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase">Score</div>
                </div>
                <div className="bg-white/5 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-white">{streaks?.total_workouts || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase">Workouts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Registration Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase">Program</span>
                <span className="text-white">{profile.program || 'Not set'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase">City</span>
                <span className="text-white">{profile.city || 'Not set'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase">Instagram</span>
                <span className="text-white">{profile.instagram_handle || 'Not set'}</span>
              </div>
              {registrations?.registration_data && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-muted-foreground block text-xs uppercase mb-1">Raw Form Data</span>
                  <pre className="bg-white/5 p-2 rounded text-[10px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(registrations.registration_data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline / Check-ins */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-white/10 bg-black/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Calendar className="w-5 h-5 mr-2 text-primary" /> Daily Check-ins Log</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.daily_check_ins?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-y border-white/10">
                      <tr>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Study</th>
                        <th className="px-3 py-2 font-medium">Fitness</th>
                        <th className="px-3 py-2 font-medium">Proofs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {profile.daily_check_ins.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((checkin: any) => (
                        <tr key={checkin.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap text-white">{checkin.date}</td>
                          <td className="px-3 py-2">
                            {checkin.is_day_completed ? (
                              <span className="text-emerald-500 font-bold">COMPLETED</span>
                            ) : (
                              <span className="text-muted-foreground">INCOMPLETE</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-white">
                            {Math.floor(checkin.study_duration_minutes / 60)}h {checkin.study_duration_minutes % 60}m
                          </td>
                          <td className="px-3 py-2">
                            {checkin.physical_activity_completed ? <span className="text-emerald-500">Yes</span> : <span className="text-muted-foreground">No</span>}
                          </td>
                          <td className="px-3 py-2 space-x-2">
                            {checkin.study_proof_url && (
                              <Link href={checkin.study_proof_url} target="_blank" className="text-primary hover:underline">Study</Link>
                            )}
                            {checkin.physical_activity_proof_url && (
                              <Link href={checkin.physical_activity_proof_url} target="_blank" className="text-primary hover:underline">Fitness</Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No check-ins logged yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
