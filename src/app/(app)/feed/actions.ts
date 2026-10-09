'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  const mediaFile = formData.get('media') as File | null

  if (!content) return { error: 'Post content cannot be empty' }

  let mediaUrl = null

  if (mediaFile && mediaFile.size > 0) {
    const ext = mediaFile.name.split('.').pop()
    const filename = `${user.id}/${Date.now()}.${ext}`
    
    const { error: uploadError } = await supabase.storage
      .from('community')
      .upload(filename, mediaFile)
      
    if (uploadError) return { error: 'Failed to upload media: ' + uploadError.message }
    mediaUrl = `/api/media?bucket=community&path=${encodeURIComponent(filename)}`
  }

  const { error } = await supabase.from('community_posts').insert({
    user_id: user.id,
    content,
    media_url: mediaUrl,
  })

  if (error) return { error: error.message }

  revalidatePath('/feed')
  return { success: 'Post created.' }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // RLS will ensure they can only delete their own post (unless admin)
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/feed')
  return { success: 'Post deleted.' }
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (!content.trim()) return { error: 'Comment cannot be empty' }

  const { error } = await supabase.from('post_comments').insert({
    post_id: postId,
    user_id: user.id,
    content,
  })

  if (error) return { error: error.message }
  
  revalidatePath('/feed')
  return { success: 'Comment added.' }
}

export async function toggleReaction(postId: string, reactionType: 'fire' | 'heart' | 'respect') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check if reaction exists
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('id, reaction_type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    if (existing.reaction_type === reactionType) {
      // Remove it if same
      await supabase.from('post_reactions').delete().eq('id', existing.id)
    } else {
      // Update it if different
      await supabase.from('post_reactions').update({ reaction_type: reactionType }).eq('id', existing.id)
    }
  } else {
    // Create new
    await supabase.from('post_reactions').insert({
      post_id: postId,
      user_id: user.id,
      reaction_type: reactionType,
    })
  }
  
  revalidatePath('/feed')
  return { success: 'Reaction updated.' }
}
