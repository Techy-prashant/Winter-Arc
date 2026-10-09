import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default async function ParticipantsPage(props: { searchParams: Promise<{ q?: string, status?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams?.q || ''
  const statusFilter = searchParams?.status || ''

  const supabase = await createClient()

  let dbQuery = supabase
    .from('profiles')
    .select(`
      id, username, full_name, email, account_status, created_at,
      streaks_progress (current_streak, longest_streak)
    `)
    .eq('role', 'participant')
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
  }
  
  if (statusFilter) {
    dbQuery = dbQuery.eq('account_status', statusFilter)
  }

  const { data: participants } = await dbQuery.limit(100)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Participant Management</h1>
          <p className="text-sm text-muted-foreground">Search, filter, and review participant compliance.</p>
        </div>
      </header>

      <Card className="border-white/10 bg-black/40">
        <CardContent className="p-4">
          <form className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                name="q"
                defaultValue={query}
                placeholder="Search username, name, email..."
                className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select 
              name="status"
              defaultValue={statusFilter}
              className="bg-white/5 border border-white/10 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
            >
              <option value="" className="bg-black text-white">All Statuses</option>
              <option value="active" className="bg-black text-white">Active</option>
              <option value="at-risk" className="bg-black text-white">At-Risk</option>
              <option value="suspended" className="bg-black text-white">Suspended</option>
            </select>
            <button type="submit" className="bg-primary text-black font-semibold px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors">
              Filter
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-y border-white/10">
                <tr>
                  <th className="px-4 py-3 font-medium">Participant</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Streak</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {participants?.map((p: any) => {
                  const streaks = Array.isArray(p.streaks_progress) ? p.streaks_progress[0] : p.streaks_progress
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{p.username}</div>
                        <div className="text-xs text-muted-foreground">{p.full_name}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={p.account_status === 'active' ? 'default' : p.account_status === 'at-risk' ? 'destructive' : 'secondary'} className={p.account_status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : ''}>
                          {p.account_status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {streaks?.current_streak || 0} 🔥
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/participants/${p.id}`} className="text-primary hover:underline text-xs font-medium">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {participants?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No participants found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
