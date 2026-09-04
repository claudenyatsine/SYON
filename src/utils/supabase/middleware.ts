import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Guard: if Supabase env vars are missing, skip auth middleware
  // rather than crashing the Edge runtime.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[Middleware] Missing Supabase env vars. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.'
    )
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // getUser(). A simple mistake can make it very hard to debug issues with sessions being lost.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/reset-password') &&
    !request.nextUrl.pathname.startsWith('/forgot-password') &&
    !request.nextUrl.pathname.startsWith('/classroom') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    request.nextUrl.pathname !== '/'
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based portal protection for authenticated users
  if (user) {
    const userRole = user.user_metadata?.role
    const pathname = request.nextUrl.pathname
    const portals = ['student', 'tutor', 'parent', 'admin']

    for (const portal of portals) {
      if (pathname === `/${portal}` || pathname.startsWith(`/${portal}/`)) {
        if (userRole && userRole !== portal && portals.includes(userRole)) {
          const url = request.nextUrl.clone()
          url.pathname = `/${userRole}`
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}
