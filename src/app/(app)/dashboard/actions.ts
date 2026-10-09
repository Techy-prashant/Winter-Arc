'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTarget(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  const is_main_target = formData.get('is_main_target') === 'true'

  if (!title) return { error: 'Title is required' }

  // Check how many main targets exist today if this is a main target
  if (is_main_target) {
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('daily_targets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('date', today)
      .eq('is_main_target', true)
    
    if (count !== null && count >= 3) {
      return { error: 'You can only have 3 Main Targets per day.' }
    }
  }

  const { error } = await supabase
    .from('daily_targets')
    .insert({
      user_id: user.id,
      title,
      is_main_target,
      completed: false
    })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleTarget(id: string, completed: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('daily_targets')
    .update({ completed })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTarget(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('daily_targets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
