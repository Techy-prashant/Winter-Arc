'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const username = formData.get('username') as string
  const fullName = formData.get('full_name') as string
  const winterGoal = formData.get('winter_goal') as string
  const workingOn = formData.get('working_on') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatarUrl = undefined

  // Handle avatar upload if provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        upsert: true
      })

    if (uploadError) {
      return { error: 'Failed to upload image: ' + uploadError.message }
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      avatarUrl = publicUrl
    }
  }

  const updates: any = {
    username,
    full_name: fullName,
    winter_goal: winterGoal,
    working_on: workingOn,
    updated_at: new Date().toISOString(),
  }

  if (avatarUrl) {
    updates.avatar_url = avatarUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  redirect('/profile')
}
