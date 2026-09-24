import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Pre-compute & cache environment variables outside the per-request lifecycle
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const SUPABASE_URL = rawUrl.trim().replace(/^["']|["']$/g, '')
const SUPABASE_ANON_KEY = rawAnonKey.trim().replace(/^["']|["']$/g, '')
const HAS_VALID_CONFIG = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('placeholder') &&
  !SUPABASE_ANON_KEY.includes('placeholder')
)

// O(1) Fast lookup for exact public routes
const EXACT_PUBLIC_ROUTES = new Set(['/', '/login', '/signup', '/reset-password', '/forgot-password'])

// Fast prefix check for dynamic public subtrees
const isPublicPath = (pathname: string): boolean => {
  if (EXACT_PUBLIC_ROUTES.has(pathname)) return true
  return (
    pathname.startsWith('/login/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/classroom/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next')
  )
}

const PORTALS = ['student', 'tutor', 'parent', 'admin'] as const
type PortalRole = (typeof PORTALS)[number]
const PORTAL_SET = new Set<string>(PORTALS)

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Guard: if Supabase config is missing, pass through without crashing Edge runtime
  if (!HAS_VALID_CONFIG) {
    return NextResponse.next({ request })
  }

  // Fast-path 1: Check if any Supabase auth cookies exist
  // Supabase stores auth tokens in cookies with prefix 'sb-' (e.g. sb-<project-ref>-auth-token)
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'))

  // If user has no auth session cookies:
  // - Public routes: Zero network calls, return in sub-millisecond
  // - Protected routes: Immediate redirect to /login without any Supabase API overhead
  if (!hasAuthCookie) {
    if (isPublicPath(pathname)) {
      return NextResponse.next({ request })
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // User has auth cookies: prepare response for potential token refresh
  let supabaseResponse = NextResponse.next({ request })

  // Use native AbortSignal.timeout (Edge runtime optimized, zero timer leaks)
  const fetchWithTimeout: typeof fetch = (input, init = {}) => {
    const timeoutSignal = AbortSignal.timeout(1500)
    const combinedSignal = init.signal
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal

    return fetch(input, {
      ...init,
      signal: combinedSignal,
    })
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      fetch: fetchWithTimeout,
    },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Verify auth session & refresh token if required
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    user = null
  }

  // Unauthenticated user attempting to view protected route
  if (!user) {
    if (!isPublicPath(pathname)) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // Role-based route guard for authenticated users
  const userRole = user.user_metadata?.role as string | undefined
  if (userRole && PORTAL_SET.has(userRole)) {
    for (const portal of PORTALS) {
      if (pathname === `/${portal}` || pathname.startsWith(`/${portal}/`)) {
        if (userRole !== portal) {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = `/${userRole}`
          return NextResponse.redirect(redirectUrl)
        }
        break
      }
    }
  }

  return supabaseResponse
}
