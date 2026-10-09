import { createClient, createAdminClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PostCreation } from './PostCreation'
import { FeedPost } from './FeedPost'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, account_status')
    .eq('id', user.id)
    .single()

  if (currentUserProfile?.account_status === 'suspended') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 text-center mt-20">
        <h1 className="text-[10px] tracking-widest text-red-500 uppercase border-b border-red-500/20 pb-2">Access Denied</h1>
        <p className="text-sm text-white/50">Your account has been suspended. The Arc is closed to you.</p>
      </div>
    )
  }

  const adminSupabase = createAdminClient()
  const { data: postsRaw } = await adminSupabase
    .from('community_posts')
    .select(`
      *,
      profiles:user_id (username, avatar_url),
      post_reactions (user_id, reaction_type),
      post_comments (count)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20 md:pb-0 animate-in fade-in duration-700">
      <header className="border-b border-white/5 pb-8">
        <div className="text-xs tracking-[0.2em] font-medium uppercase text-white/50 mb-2">
          PRIVATE FEED
        </div>
        <h1 className="text-4xl font-medium tracking-tight text-white uppercase">
          Threads
        </h1>
      </header>

      <PostCreation currentUser={currentUserProfile || { id: user.id }} />

      <div className="space-y-12 pt-8">
        {postsRaw?.map((post) => (
          <FeedPost key={post.id} post={post} currentUserId={user.id} />
        ))}
        {postsRaw?.length === 0 && (
          <div className="text-center p-8 text-[10px] tracking-[0.2em] uppercase text-white/30 border border-white/5">
            The Arc is quiet. Be the first to post.
          </div>
        )}
      </div>
    </div>
  )
}
