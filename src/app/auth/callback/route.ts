import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const intendedRole = next.split('?')[0].split('/').filter(Boolean)[0] // e.g. 'tutor' or 'student'
  const validRoles = ['student', 'tutor', 'parent', 'admin']
  const effectiveIntendedRole = intendedRole && validRoles.includes(intendedRole) ? intendedRole : null
  const roleRedirectPath = effectiveIntendedRole 
    ? `/login/${effectiveIntendedRole}` 
    : '/login'

  const action = searchParams.get('action')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role, full_name, avatar_url, created_at')
        .eq('id', data.user.id)
        .single()

      // Determine if this is a newly created user account.
      // Database triggers on auth.users create a profile immediately on signup with default role 'student'.
      // Therefore, a user is considered "new" if:
      // 1. Their auth user was created within the last 2 minutes, OR
      // 2. Their profile was created within the last 2 minutes, OR
      // 3. The OAuth was explicitly triggered as a signup (action === 'signup'), OR
      // 4. No profile exists yet.
      const userCreatedAt = data.user.created_at ? new Date(data.user.created_at).getTime() : 0
      const isFreshAuthUser = userCreatedAt > 0 && (Date.now() - userCreatedAt) < 120000

      const profileCreatedAt = existingProfile?.created_at ? new Date(existingProfile.created_at).getTime() : 0
      const isFreshProfile = profileCreatedAt > 0 && (Date.now() - profileCreatedAt) < 120000

      const isNewUser = !existingProfile || isFreshAuthUser || isFreshProfile || action === 'signup'

      const metaRole = data.user.user_metadata?.role
      const targetRole = effectiveIntendedRole || metaRole || existingProfile?.role || 'student'
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || existingProfile?.full_name || ''
      const avatarUrl = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || existingProfile?.avatar_url || ''

      if (isNewUser) {
        // NEW USER: Upsert profile with the selected role from URL or metadata
        const profilePayload: Record<string, any> = {
          id: data.user.id,
          email: data.user.email,
          role: targetRole,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' })

        if (upsertError) {
          console.error('[Auth Callback] Profile upsert error:', upsertError)
        }

        // Sync role to user_metadata
        await supabase.auth.updateUser({
          data: {
            role: targetRole,
            full_name: fullName,
            avatar_url: avatarUrl,
          }
        })

        const destination = `/${targetRole}`
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${destination}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${destination}`)
        } else {
          return NextResponse.redirect(`${origin}${destination}`)
        }
      }

      // RETURNING ESTABLISHED USER:
      if (existingProfile) {
        // If user logged into a role-specific page (e.g. /login/tutor) that doesn't match their role
        if (effectiveIntendedRole && existingProfile.role !== effectiveIntendedRole) {
          await supabase.auth.signOut()

          let errorMessage = `This account is registered as a ${existingProfile.role}. Please use the ${existingProfile.role} portal.`
          if (action === 'signup') {
            errorMessage = `This email is already registered as a ${existingProfile.role}. An email can only be assigned to one role.`
          }

          return NextResponse.redirect(
            `${origin}${roleRedirectPath}?error=${encodeURIComponent(errorMessage)}`
          )
        }

        // Redirect to their actual registered dashboard
        const destination = `/${existingProfile.role}`
        return NextResponse.redirect(`${origin}${destination}`)
      }
    } else if (error) {
      console.error('[Auth Callback] Session exchange failed:', error)
      return NextResponse.redirect(`${origin}${roleRedirectPath}?error=${encodeURIComponent(error.message)}`)
    }
  } else {
    // If no code, check for error query parameters from Supabase/provider
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    if (errorParam || errorDescription) {
      console.error('[Auth Callback] OAuth error returned from provider:', errorParam, errorDescription)
      return NextResponse.redirect(`${origin}${roleRedirectPath}?error=${encodeURIComponent(errorDescription || errorParam || 'OAuth login failed')}`)
    }
  }

  return NextResponse.redirect(`${origin}${roleRedirectPath}?error=${encodeURIComponent('Authentication code error or missing session')}`)
}

