import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, AlertTriangle, ShieldX, TrendingUp, CheckCircle, Database } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Total Participants (all roles = participant)
  const { count: totalParticipants } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'participant')

  // 2. Account Statuses
  const { data: statuses } = await supabase
    .from('profiles')
    .select('account_status')
    .eq('role', 'participant')

  const activeCount = statuses?.filter(s => s.account_status === 'active').length || 0
  const atRiskCount = statuses?.filter(s => s.account_status === 'at-risk').length || 0
  const inactiveCount = statuses?.filter(s => s.account_status === 'suspended').length || 0

  // 3. Today's Submissions
  const today = new Date().toISOString().split('T')[0]
  const { count: todaysSubmissions } = await supabase
    .from('daily_check_ins')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)

  // 4. Top Consistency
  const { data: topConsistent } = await supabase
    .from('streaks_progress')
    .select('user_id, current_streak, leaderboard_score, profiles(username)')
    .order('leaderboard_score', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase">Command Center</h1>
        <p className="text-muted-foreground">High-density overview of Winter Arc participation and compliance.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-black/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalParticipants || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Participants</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Good standing</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">At-Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Nearing inactivity limit</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive / Suspended</CardTitle>
            <ShieldX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inactiveCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Removed from Arc</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Today's Pulse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold text-white">{todaysSubmissions || 0}</p>
                <p className="text-sm text-muted-foreground">Check-ins logged today</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {(totalParticipants && todaysSubmissions) 
                  ? `${Math.round((todaysSubmissions / totalParticipants) * 100)}% Participation rate`
                  : 'No data'
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="mr-2 h-5 w-5 text-yellow-500" /> Top Consistencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topConsistent?.map((user: any, i) => (
                <div key={user.user_id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-4 mr-2">{i+1}.</span>
                    <span className="text-white font-medium">{Array.isArray(user.profiles) ? user.profiles[0]?.username : user.profiles?.username}</span>
                  </div>
                  <div className="flex space-x-4 text-muted-foreground">
                    <span>🔥 {user.current_streak}</span>
                    <span className="text-primary font-bold">{user.leaderboard_score}</span>
                  </div>
                </div>
              ))}
              {!topConsistent?.length && (
                <p className="text-muted-foreground text-sm">No data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/import" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-white flex items-center transition-colors">
            <Database className="mr-2 h-4 w-4" /> Data Import
          </Link>
          <Link href="/admin/participants" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-white flex items-center transition-colors">
            <Users className="mr-2 h-4 w-4" /> Manage Participants
          </Link>
        </div>
      </div>
    </div>
  )
}
