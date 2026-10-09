'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setParticipantStatus(userId: string, status: 'active' | 'suspended' | 'at-risk') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Double check admin role on server side
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') return { error: 'Not authorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ account_status: status })
    .eq('id', userId)

  if (error) return { error: error.message }
  
  revalidatePath(`/admin/participants/${userId}`)
  revalidatePath('/admin/participants')
  
  return { success: `Status updated to ${status}` }
}
