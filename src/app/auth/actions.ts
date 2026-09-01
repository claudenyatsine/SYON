'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const role = formData.get('role') as string
  const authData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data, error } = await supabase.auth.signInWithPassword(authData)

  if (error) {
    return { error: error.message }
  }

  // Fetch profile via admin client to avoid any RLS blockages
  const adminClient = createAdminClient()
  let { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle()

  const metaRole = data.user.user_metadata?.role

  // Self-healing: If user signed up with a specific role in metadata (e.g. parent/tutor/admin)
  // and is logging into that matching portal, but the database profile defaulted to 'student'
  // or was missing, heal the profile record in the database immediately.
  if (metaRole && role && metaRole === role && profile?.role !== metaRole) {
    await adminClient.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name || profile?.full_name || data.user.email?.split('@')[0],
      role: metaRole,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

    if (profile) {
      profile.role = metaRole
    }
  }

  const userRole = profile?.role || metaRole || 'student'

  if (userRole !== role) {
    // Sign out immediately if role mismatch
    await supabase.auth.signOut()
    return { error: `This account is registered as a ${userRole}. Please log in through the correct portal.` }
  }

  // Ensure profile exists if it was completely missing
  if (!profile) {
    await adminClient.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      role: userRole,
      full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })
  }

  revalidatePath('/', 'layout')
  
  // Explicitly redirect based on determined role
  if (userRole === 'tutor') {
    return redirect('/tutor')
  }
  if (userRole === 'admin') {
    return redirect('/admin')
  }
  if (userRole === 'parent') {
    return redirect('/parent')
  }
  
  // Default for students
  redirect('/student')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = (formData.get('role') as string) || 'student'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Immediately ensure the profile record exists with the EXACT chosen role using Admin Client
  // to prevent DB default triggers or RLS from defaulting the user to 'student'.
  if (data.user) {
    try {
      const adminClient = createAdminClient()
      await adminClient.from('profiles').upsert({
        id: data.user.id,
        email: email,
        full_name: fullName || email.split('@')[0],
        role: role,
        is_approved: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    } catch (upsertErr) {
      console.error('[Signup] Error persisting chosen role to profile:', upsertErr)
    }
  }

  revalidatePath('/', 'layout')
  
  // If a session exists, the user is already logged in (email confirmation disabled)
  if (data.session) {
    const destination = `/${role}`
    return { success: true, redirect: destination, message: 'Account created successfully! Redirecting...' }
  }

  // If email confirmation is required / default:
  return { 
    success: true, 
    requireConfirmation: true, 
    message: 'Your account was created successfully! Please check your email to confirm, then log in.' 
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim()
  const origin = (formData.get('origin') as string)?.trim()

  if (!email) {
    return { error: 'Please provide a valid email address.' }
  }

  const redirectTo = origin
    ? `${origin}/auth/callback?next=/reset-password`
    : undefined

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Password reset link has been sent to your email.' }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

