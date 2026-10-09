import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bucket = searchParams.get('bucket')
  const path = searchParams.get('path')

  if (!bucket || !path) {
    return new NextResponse('Missing bucket or path', { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Use download from Supabase storage using the authenticated client
  // If the RLS policies deny access, this will fail securely
  const { data, error } = await supabase.storage.from(bucket).download(path)

  if (error || !data) {
    return new NextResponse('File not found or access denied', { status: 404 })
  }

  // Forward the Blob content type
  const headers = new Headers()
  headers.set('Content-Type', data.type || 'application/octet-stream')
  headers.set('Cache-Control', 'private, max-age=3600')

  return new NextResponse(data, { headers })
}
