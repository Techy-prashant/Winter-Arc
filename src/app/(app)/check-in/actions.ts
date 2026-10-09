'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { calculateAccountability } from '@/services/accountability'

export async function submitDailyCheckIn(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Parse fields
  const studyHours = parseFloat(formData.get('study_hours') as string || '0')
  const studyDescription = formData.get('study_description') as string
  const studyLearned = formData.get('study_learned') as string
  
  const physicalActivityCompleted = formData.get('physical_activity_completed') === 'on'
  const physicalActivityType = formData.get('physical_activity_type') as string
  const physicalActivityDuration = parseInt(formData.get('physical_activity_duration') as string || '0', 10)

  // Handle files uploaded from client
  let studyProofUrl = formData.get('study_proof_url') as string || ''
  let physicalProofUrl = formData.get('physical_proof_url') as string || ''

  const today = new Date().toISOString().split('T')[0]

  // Check if check-in exists to preserve old URLs if not updated
  const { data: existingCheckIn } = await supabase
    .from('daily_check_ins')
    .select('study_proof_url, physical_activity_proof_url')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const payload = {
    user_id: user.id,
    date: today,
    study_duration_minutes: Math.round(studyHours * 60),
    study_description: studyDescription,
    study_learned: studyLearned,
    study_proof_url: studyProofUrl || existingCheckIn?.study_proof_url,
    physical_activity_completed: physicalActivityCompleted,
    physical_activity_type: physicalActivityType,
    physical_activity_duration_minutes: physicalActivityDuration,
    physical_activity_proof_url: physicalProofUrl || existingCheckIn?.physical_activity_proof_url
  }

  const { error } = await supabase
    .from('daily_check_ins')
    .upsert(payload, { onConflict: 'user_id, date' })

  if (error) {
    return { error: error.message }
  }

  // --- Accountability Engine Sync ---
  // 1. Fetch all check-ins for the user
  const { data: allCheckIns } = await supabase
    .from('daily_check_ins')
    .select('date, study_duration_minutes, physical_activity_completed')
    .eq('user_id', user.id)

  if (allCheckIns) {
    // 2. Run deterministic calculation
    const stats = calculateAccountability(allCheckIns, today)

    // 3. Upsert to streaks_progress using Admin Client (Bypass RLS)
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await adminSupabase.from('streaks_progress').upsert({
      user_id: user.id,
      current_streak: stats.currentStreak,
      longest_streak: stats.longestStreak,
      total_study_minutes: stats.totalStudyMinutes,
      total_workouts: stats.totalWorkouts,
      leaderboard_score: stats.leaderboardScore,
      last_updated: new Date().toISOString()
    }, { onConflict: 'user_id' })

    // 4. Update profile status if at risk
    if (stats.isAtRisk) {
      await adminSupabase.from('profiles').update({ account_status: 'at-risk' }).eq('id', user.id)
    }
  }
  // ----------------------------------

  revalidatePath('/dashboard')
  revalidatePath('/check-in')
  
  return { success: 'Check-in submitted successfully.' }
}
