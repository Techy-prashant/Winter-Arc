'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const adminAuth = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const username = formData.get('username') as string

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user account.' }
  }

  // 2. Create the profile row manually (since we don't have a trigger)
  // We use the admin client here just in case RLS blocks insert on profiles for new users without a session fully established yet
  const { error: profileError } = await adminAuth
    .from('profiles')
    .insert([
      {
        id: authData.user.id,
        email: email,
        full_name: fullName,
        username: username.toLowerCase().replace(/\s+/g, ''),
        role: 'participant', // Default role
        onboarded: false
      }
    ])

  if (profileError) {
    return { error: 'Account created, but failed to setup profile: ' + profileError.message }
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}
