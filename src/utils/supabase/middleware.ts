import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const isPublicPath = (pathname: string): boolean => {
  return (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/classroom') ||
    pathname.startsWith('/api')
  )
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '')
  const supabaseAnonKey = rawAnonKey.trim().replace(/^["']|["']$/g, '')

  // Guard: if Supabase env vars are missing, skip auth middleware
  // rather than crashing the Edge runtime.
  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('placeholder') || supabaseUrl.includes('placeholder')) {
    console.error(
      '[Middleware] Missing or placeholder Supabase env vars. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.'
    )
    return NextResponse.next({ request })
  }

  // Fast-path: Check if any Supabase session cookies exist
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some((cookie) => cookie.name.startsWith('sb-'))

  // If there are no auth cookies at all:
  // 1. For public routes: return immediately without making external network calls.
  // 2. For protected routes: redirect immediately to /login without waiting for timeouts.
  if (!hasAuthCookie) {
    if (isPublicPath(pathname)) {
      return NextResponse.next({ request })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Timeout controller for Supabase HTTP requests to prevent Edge Function timeouts (5s limit on Vercel)
  const FETCH_TIMEOUT_MS = 2000
  const fetchWithTimeout: typeof fetch = async (input, init = {}) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    if (init?.signal) {
      init.signal.addEventListener('abort', () => controller.abort())
    }

    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        fetch: fetchWithTimeout,
      },
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

  // Fetch user with safety timeout race (2500ms limit)
  let user = null
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase auth timeout')), 2500)
    )

    const result = await Promise.race([
      supabase.auth.getUser(),
      timeoutPromise,
    ])

    user = result?.data?.user ?? null
  } catch (err: any) {
    console.warn(
      `[Middleware] Auth verification timed out or failed for ${pathname}:`,
      err?.message || err
    )
    user = null
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based portal protection for authenticated users
  if (user) {
    const userRole = user.user_metadata?.role
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
