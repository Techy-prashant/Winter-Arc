'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const username = formData.get('username') as string
  const workingOn = formData.get('working_on') as string
  const currentStudyHours = parseInt(formData.get('current_study_hours') as string || '0', 10)
  const targetStudyHours = parseInt(formData.get('target_study_hours') as string || '0', 10)
  const winterGoal = formData.get('winter_goal') as string

  if (!username || username.length < 3) {
    return { error: 'Username must be at least 3 characters long' }
  }

  // Check if username is taken
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (existingUser && existingUser.id !== user.id) {
    return { error: 'Username is already taken' }
  }

  // Start updating
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      username: username,
      working_on: workingOn,
      current_study_hours: currentStudyHours,
      target_study_hours: targetStudyHours,
      winter_goal: winterGoal,
      onboarded: true 
    })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  // Update or insert consent records
  const { error: consentError } = await supabase
    .from('consent_records')
    .upsert({ 
      user_id: user.id, 
      agreed_to_rules: true, 
      community_visibility: true 
    }, { onConflict: 'user_id' })

  if (consentError) {
    console.error('Failed to insert consent:', consentError)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
