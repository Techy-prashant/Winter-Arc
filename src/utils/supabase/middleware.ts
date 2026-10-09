import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define protected routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedRoute = 
    isAdminRoute || 
    ['/dashboard', '/check-in', '/feed', '/leaderboard', '/challenges', '/settings', '/onboarding', '/profile'].some(route => pathname.startsWith(route))

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, perform profile checks
  if (user) {
    // We shouldn't query the DB on every single request if possible, but for a small app it's fine.
    // In production, you might want to cache this or use a JWT custom claim.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, account_status, onboarded')
      .eq('id', user.id)
      .single()

    if (profile) {
      // 1. Suspension Check
      if (profile.account_status === 'suspended' && pathname !== '/suspended') {
        const url = request.nextUrl.clone()
        url.pathname = '/suspended'
        return NextResponse.redirect(url)
      }

      // 2. Onboarding Check
      if (!profile.onboarded && pathname !== '/onboarding' && profile.account_status !== 'suspended') {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }

      // If onboarded, prevent access to /onboarding
      if (profile.onboarded && pathname === '/onboarding') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }

      // 3. Admin Authorization Check
      if (isAdminRoute && profile.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // 4. If user is logged in and tries to access public landing or login
    if (pathname === '/' || pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = profile?.role === 'admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
