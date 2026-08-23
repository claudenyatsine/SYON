import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const intendedRole = next.split('?')[0].split('/').filter(Boolean)[0] // e.g. 'tutor' or 'student'
  const validRoles = ['student', 'tutor', 'parent', 'admin']
  const roleRedirectPath = intendedRole && validRoles.includes(intendedRole) 
    ? `/login/${intendedRole}` 
    : '/login'

  const action = searchParams.get('action')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user already has a profile (returning user)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (existingProfile) {
        // RETURNING USER: enforce role — block if they're trying the wrong portal
        if (intendedRole && existingProfile.role !== intendedRole) {
          await supabase.auth.signOut()
          
          let errorMessage = `This account is registered as a ${existingProfile.role}. Please use the correct portal.`;
          if (action === 'signup') {
            errorMessage = `This email is already registered as a ${existingProfile.role}. An email can only be assigned to one role.`;
          }
          
          return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(errorMessage)}`
          )
        }
        // Redirect to their actual dashboard
        const destination = `/${existingProfile.role}`
        return NextResponse.redirect(`${origin}${destination}`)
      }

      // NEW USER: upsert the profile with the role from metadata or URL
      const metaRole = data.user.user_metadata?.role;
      const finalRole = metaRole || intendedRole || 'student';
      const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || '';
      const avatarUrl = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '';

      const profilePayload: Record<string, any> = {
        id: data.user.id,
        email: data.user.email,
        role: finalRole,
      };

      const { error: upsertError } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });

      if (upsertError) {
        // Handle trigger constraint violations or RLS errors
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}${roleRedirectPath}?error=${encodeURIComponent('Error creating your profile. If you have already registered with a different role, please use the correct login portal.')}`);
      }

      const destination = `/${finalRole}`
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${destination}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${destination}`)
      } else {
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

