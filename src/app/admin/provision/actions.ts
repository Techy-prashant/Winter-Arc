'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `Winter-${code}`
}

function generateUsername(fullName: string) {
  // basic normalized username
  return fullName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000)
}

export async function provisionAccounts() {
  const supabase = await createClient()
  
  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: "Forbidden" }

  const adminAuth = createAdminClient()

  // Fetch unprovisioned registrations
  const { data: regs, error: fetchError } = await supabase
    .from('participant_registrations')
    .select('*')
    .is('profile_id', null)

  if (fetchError) return { error: fetchError.message }
  if (!regs || regs.length === 0) return { success: true, message: 'All participants are already provisioned.', provisioned: [] }

  const provisionedUsers = []

  for (const reg of regs) {
    const email = reg.original_email
    const password = generatePassword()
    const fullName = reg.registration_data['Name'] || reg.registration_data['Full Name'] || 'Participant'
    const username = generateUsername(fullName)

    // 1. Create User
    const { data: authData, error: authError } = await adminAuth.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    })

    if (authError) {
      console.error(`Failed to create auth user for ${email}`, authError)
      continue
    }

    const userId = authData.user.id

    // 2. Create Profile
    const { error: profileError } = await adminAuth
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        username: username,
        role: 'participant',
        onboarded: false
      })

    if (profileError) {
      console.error(`Failed to create profile for ${email}`, profileError)
      // Cleanup auth user? For now just log
      continue
    }

    // 3. Link back to Registration
    await adminAuth
      .from('participant_registrations')
      .update({ profile_id: userId })
      .eq('id', reg.id)

    provisionedUsers.push({
      email,
      password,
      fullName
    })
  }

  return { 
    success: true, 
    message: `Successfully provisioned ${provisionedUsers.length} accounts.`, 
    provisioned: provisionedUsers 
  }
}
