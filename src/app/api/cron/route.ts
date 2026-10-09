import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  // Basic security for CRON (Vercel uses Bearer tokens, or we check a custom secret)
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch all active participants
  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('account_status', 'active')

  if (!profiles) return NextResponse.json({ success: true, updated: 0 })

  let updatedCount = 0
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  for (const profile of profiles) {
    // 2. Fetch their streak progress
    const { data: streak } = await adminSupabase
      .from('streaks_progress')
      .select('last_completed_date')
      .eq('user_id', profile.id)
      .single()

    if (streak && streak.last_completed_date) {
      const lastDate = new Date(streak.last_completed_date)
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24))
      
      if (diffDays >= 3) {
        // Flag as at-risk
        await adminSupabase
          .from('profiles')
          .update({ account_status: 'at-risk' })
          .eq('id', profile.id)
        updatedCount++
      }
    }
  }

  return NextResponse.json({ success: true, updated: updatedCount })
}
