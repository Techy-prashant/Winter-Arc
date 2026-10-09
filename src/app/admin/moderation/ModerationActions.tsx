'use client'

import { removePost, restorePost, removeComment } from './actions'
import { useState } from 'react'

export function PostActions({ postId, status }: { postId: string, status: string }) {
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    await removePost(postId)
    setLoading(false)
  }

  const handleRestore = async () => {
    setLoading(true)
    await restorePost(postId)
    setLoading(false)
  }

  if (status === 'removed') {
    return (
      <button 
        disabled={loading}
        onClick={handleRestore}
        className="px-3 py-1 bg-white/10 text-white rounded text-xs disabled:opacity-50"
      >
        Restore
      </button>
    )
  }

  return (
    <button 
      disabled={loading}
      onClick={handleRemove}
      className="px-3 py-1 bg-destructive/20 text-destructive rounded text-xs disabled:opacity-50"
    >
      Remove
    </button>
  )
}

export function CommentActions({ commentId }: { commentId: string }) {
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    await removeComment(commentId)
    setLoading(false)
  }

  return (
    <button 
      disabled={loading}
      onClick={handleRemove}
      className="px-3 py-1 bg-destructive/20 text-destructive rounded text-xs disabled:opacity-50"
    >
      Remove Comment
    </button>
  )
}
