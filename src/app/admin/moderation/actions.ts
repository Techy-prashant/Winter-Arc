'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function removePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') return { error: 'Not authorized' }

  const { error } = await supabase
    .from('community_posts')
    .update({ 
      moderation_status: 'removed',
      moderated_by: user.id,
      moderated_at: new Date().toISOString()
    })
    .eq('id', postId)
    
  if (error) return { error: error.message }
  revalidatePath('/admin/moderation')
  return { success: 'Post removed' }
}

export async function restorePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') return { error: 'Not authorized' }

  const { error } = await supabase
    .from('community_posts')
    .update({ 
      moderation_status: 'approved',
      moderated_by: user.id,
      moderated_at: new Date().toISOString()
    })
    .eq('id', postId)
    
  if (error) return { error: error.message }
  revalidatePath('/admin/moderation')
  return { success: 'Post restored' }
}

export async function removeComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') return { error: 'Not authorized' }

  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId)
    
  if (error) return { error: error.message }
  revalidatePath('/admin/moderation')
  return { success: 'Comment removed' }
}
