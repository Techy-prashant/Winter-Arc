'use client'

import { useState } from 'react'
import { toggleReaction, deletePost } from './actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Trash2, Flame } from 'lucide-react'
import Image from 'next/image'

export function FeedPost({ post, currentUserId }: { post: any, currentUserId: string }) {
  const [deleting, setDeleting] = useState(false)
  const isOwner = post.user_id === currentUserId
  const [reactions, setReactions] = useState(post.post_reactions || [])

  const hasLiked = reactions.some((r: any) => r.user_id === currentUserId && r.reaction_type === 'fire')
  const fireCount = reactions.filter((r: any) => r.reaction_type === 'fire').length

  async function handleReact() {
    if (hasLiked) {
      setReactions(reactions.filter((r: any) => !(r.user_id === currentUserId && r.reaction_type === 'fire')))
    } else {
      setReactions([...reactions, { user_id: currentUserId, reaction_type: 'fire' }])
    }
    await toggleReaction(post.id, 'fire')
  }

  async function handleDelete() {
    if (confirm('Delete this post?')) {
      setDeleting(true)
      await deletePost(post.id)
      setDeleting(false)
    }
  }

  if (deleting) return null

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback className="bg-transparent text-[10px] text-white/50 rounded-full">
              {post.profiles?.username?.substring(0,2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-baseline space-x-3">
            <p className="tracking-wider uppercase text-xs text-white font-medium">{post.profiles?.username}</p>
            <p className="text-[10px] tracking-widest text-white/30 uppercase">{new Date(post.created_at).toLocaleString()}</p>
          </div>
        </div>
        
        {isOwner && (
          <button onClick={handleDelete} className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      
      <div className="pl-12 space-y-4">
        <p className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">{post.content}</p>
        
        {post.media_url && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <img src={post.media_url} alt="Post media" className="w-full h-auto max-h-[700px] object-contain" />
          </div>
        )}

        <div className="flex space-x-6 pt-4 text-white/40">
          <button 
            onClick={handleReact}
            className={`flex items-center space-x-2 text-[10px] tracking-widest transition-colors ${hasLiked ? 'text-white' : 'hover:text-white/80'}`}
          >
            <Flame className="h-3 w-3" />
            <span>{fireCount}</span>
          </button>
          <div className="flex items-center space-x-2 text-[10px] tracking-widest transition-colors cursor-not-allowed opacity-50">
            <MessageSquare className="h-3 w-3" />
            <span>{post.post_comments?.[0]?.count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
