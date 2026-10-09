'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitChallenge(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const challengeId = formData.get('challenge_id') as string
  const textResponse = formData.get('text_response') as string
  const proofFile = formData.get('proof_file') as File | null

  if (!challengeId) return { error: 'Missing challenge ID' }
  if (!textResponse && (!proofFile || proofFile.size === 0)) {
    return { error: 'You must provide either a text response or a proof file.' }
  }

  let proofUrl = ''

  if (proofFile && proofFile.size > 0) {
    const ext = proofFile.name.split('.').pop()
    const filename = `${user.id}/challenge-${challengeId}-${Date.now()}.${ext}`
    
    const { error: uploadError } = await supabase.storage
      .from('proofs')
      .upload(filename, proofFile)
      
    if (uploadError) return { error: 'Failed to upload proof: ' + uploadError.message }
    
    proofUrl = `/api/media?bucket=proofs&path=${encodeURIComponent(filename)}`
  }

  const { error } = await supabase
    .from('challenge_submissions')
    .upsert(
      {
        challenge_id: challengeId,
        user_id: user.id,
        text_response: textResponse,
        proof_url: proofUrl,
        submitted_at: new Date().toISOString()
      },
      { onConflict: 'challenge_id, user_id' }
    )

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/challenges')
  return { success: 'Challenge submitted successfully!' }
}
