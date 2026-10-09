import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EditProfileForm from './EditProfileForm'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="pb-20">
      <EditProfileForm profile={profile} />
    </div>
  )
}
