import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { calculateAccountability } from '@/services/accountability'

export async function POST(req: Request) {
  try {
    // 1. Authenticate request using a server-side secret
    const authHeader = req.headers.get('Authorization')
    const expectedToken = process.env.GOOGLE_FORMS_WEBHOOK_SECRET

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    const { 
      email, 
      date, 
      study_duration_minutes, 
      study_description, 
      study_learned,
      physical_activity_completed,
      physical_activity_type,
      physical_activity_duration_minutes,
      study_proof_url,
      physical_proof_url
    } = body

    if (!email || !date) {
      return NextResponse.json({ error: 'Missing email or date' }, { status: 400 })
    }

    // 2. Init Admin Supabase Client (bypasses RLS to write webhook data safely)
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Match the participant to an existing account using registered email
    const cleanEmail = email.trim().toLowerCase()
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .single()

    if (profileError || !profile) {
      console.error(`Google Forms Webhook: Unregistered email rejected - ${cleanEmail}`)
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    const userId = profile.id

    // Check if check-in exists to preserve old URLs if not updated
    const { data: existingCheckIn } = await adminSupabase
      .from('daily_check_ins')
      .select('study_proof_url, physical_activity_proof_url')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    // 4. Process submissions idempotently and update daily_check_ins
    const payload = {
      user_id: userId,
      date: date,
      study_duration_minutes: study_duration_minutes || 0,
      study_description: study_description || '',
      study_learned: study_learned || '',
      study_proof_url: study_proof_url || existingCheckIn?.study_proof_url || '',
      physical_activity_completed: physical_activity_completed || false,
      physical_activity_type: physical_activity_type || '',
      physical_activity_duration_minutes: physical_activity_duration_minutes || 0,
      physical_activity_proof_url: physical_proof_url || existingCheckIn?.physical_activity_proof_url || ''
    }

    const { error: upsertError } = await adminSupabase
      .from('daily_check_ins')
      .upsert(payload, { onConflict: 'user_id, date' })

    if (upsertError) {
      console.error(`Google Forms Webhook: Check-in upsert failed - ${upsertError.message}`)
      return NextResponse.json({ error: 'Failed to update check-in' }, { status: 500 })
    }

    // 5. Update streaks/accountability according to existing rules
    const { data: allCheckIns } = await adminSupabase
      .from('daily_check_ins')
      .select('date, study_duration_minutes, physical_activity_completed')
      .eq('user_id', userId)

    if (allCheckIns) {
      const stats = calculateAccountability(allCheckIns, date)

      await adminSupabase.from('streaks_progress').upsert({
        user_id: userId,
        current_streak: stats.currentStreak,
        longest_streak: stats.longestStreak,
        total_study_minutes: stats.totalStudyMinutes,
        total_workouts: stats.totalWorkouts,
        leaderboard_score: stats.leaderboardScore,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id' })

      if (stats.isAtRisk) {
        await adminSupabase.from('profiles').update({ account_status: 'at-risk' }).eq('id', userId)
      }
    }

    return NextResponse.json({ success: true, message: 'Check-in processed successfully' })

  } catch (err: any) {
    console.error(`Google Forms Webhook: Unexpected error - ${err.message}`)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
