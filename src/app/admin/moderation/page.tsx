import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PostActions, CommentActions } from './ModerationActions'

export default async function ModerationPage() {
  const supabase = await createClient()

  // Fetch posts with their authors and comments
  const { data: posts } = await supabase
    .from('community_posts')
    .select(`
      id, content, media_url, moderation_status, created_at,
      profiles:user_id (id, username, full_name),
      post_comments (
        id, content, created_at,
        profiles:user_id (id, username)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Community Moderation</h1>
        <p className="text-sm text-muted-foreground">Review and manage posts, comments, and media.</p>
      </header>

      <div className="space-y-6">
        {posts?.map((post: any) => (
          <Card key={post.id} className="border-white/10 bg-black/40">
            <CardHeader className="flex flex-row justify-between items-start pb-2">
              <div>
                <CardTitle className="text-base text-white">
                  Post by @{post.profiles?.username}
                </CardTitle>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant={post.moderation_status === 'removed' ? 'destructive' : 'secondary'}>
                  {post.moderation_status}
                </Badge>
                <PostActions postId={post.id} status={post.moderation_status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-300">
                {post.content}
              </div>
              
              {post.media_url && (
                <div className="mt-2">
                  <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">
                    [View Attached Media]
                  </a>
                </div>
              )}

              {post.post_comments && post.post_comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Comments</h4>
                  {post.post_comments.map((comment: any) => (
                    <div key={comment.id} className="flex justify-between items-start bg-white/5 p-3 rounded-md">
                      <div>
                        <div className="text-xs font-semibold text-white mb-1">@{comment.profiles?.username}</div>
                        <div className="text-sm text-gray-300">{comment.content}</div>
                      </div>
                      <CommentActions commentId={comment.id} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!posts?.length && (
          <div className="text-muted-foreground text-sm text-center py-8">No posts to moderate.</div>
        )}
      </div>
    </div>
  )
}
