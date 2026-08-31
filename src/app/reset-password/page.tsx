'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { updatePassword } from '@/app/auth/actions';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    async function checkAuthSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasSession(true);
        } else {
          // If no active recovery session found
          setHasSession(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsSessionChecking(false);
      }
    }
    checkAuthSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try client-side update with Supabase Auth
      const { error: clientError } = await supabase.auth.updateUser({
        password: password
      });

      if (clientError) {
        // 2. Fallback to server action
        const formData = new FormData();
        formData.append('password', password);
        const serverRes = await updatePassword(formData);

        if (serverRes?.error) {
          setErrorMessage(serverRes.error || clientError.message);
          toast({
            variant: 'destructive',
            title: 'Failed to update password',
            description: serverRes.error || clientError.message,
          });
          setIsLoading(false);
          return;
        }
      }

      setIsSuccess(true);
      toast({
        title: 'Password Updated! 🎉',
        description: 'Your password has been reset successfully. You can now log in.',
      });

      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/login?message=Password+updated+successfully!+Please+log+in.');
      }, 2500);

    } catch (err: any) {
      console.error('Update password exception:', err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto mb-2 shadow-lg shadow-[#D4AF37]/10">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Set New Password</h2>
        <p className="text-muted-foreground text-xs">
          Create a secure password to regain access to your account.
        </p>
      </div>

      {isSessionChecking ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          <p className="text-xs text-muted-foreground">Verifying password recovery session...</p>
        </div>
      ) : isSuccess ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-center space-y-4 shadow-xl"
        >
          <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/40">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Password Reset Complete!</h3>
            <p className="text-xs text-muted-foreground">
              Your password has been changed. Redirecting to login page in a moment...
            </p>
          </div>
          <Button asChild className="w-full bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-[#c29f2f] h-10">
            <Link href="/login">Go to Login Now</Link>
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-400 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {!hasSession && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-amber-300 text-[11px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Tip: Make sure you opened this page from the password reset link sent to your email inbox.
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password (min. 6 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-card border-border text-foreground h-11 rounded-xl pr-10 text-xs focus-visible:ring-[#D4AF37]"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="bg-card border-border text-foreground h-11 rounded-xl pr-10 text-xs focus-visible:ring-[#D4AF37]"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {password && confirmPassword && (
            <div className="text-[11px] flex items-center gap-1.5">
              {password === confirmPassword ? (
                <span className="text-green-400 font-medium flex items-center gap-1">
                  ✓ Passwords match
                </span>
              ) : (
                <span className="text-red-400 font-medium flex items-center gap-1">
                  ✕ Passwords do not match
                </span>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || password.length < 6 || password !== confirmPassword}
            className="w-full bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold h-11 rounded-xl text-xs transition-all shadow-lg shadow-[#D4AF37]/20 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft size={13} /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] bg-background overflow-hidden">
      {/* Left Column Graphic */}
      <div className="hidden lg:flex relative bg-background p-10 flex-col justify-between overflow-hidden border-r border-border">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-15 pointer-events-none"
        >
          <source src="/make_it_a_male_voice___the_ui.mp4" type="video/mp4" />
        </video>

        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md">
              <Image src="/logo.png" alt="Dr Max Logo" width={28} height={28} className="object-contain" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Dr Max</h2>
          </div>

          <div className="space-y-4 max-w-md mt-12">
            <span className="text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] px-3 py-1 rounded-full border border-[#D4AF37]/30 font-bold uppercase tracking-wider">
              Account Security
            </span>
            <h1 className="text-4xl font-extrabold text-foreground leading-tight tracking-tight">
              Reset Your <br />
              <span className="text-[#D4AF37]">Account Password</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ensure your new password is at least 6 characters long and contains a combination of letters, numbers, and symbols.
            </p>
          </div>
        </div>

        <div className="relative z-10 p-4 rounded-2xl bg-card/60 border border-border backdrop-blur-sm max-w-md">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#D4AF37] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-foreground">End-to-End Encryption</h4>
              <p className="text-[11px] text-muted-foreground">All password updates are cryptographically hashed and verified.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background overflow-y-auto">
        <Suspense fallback={<div className="text-muted-foreground text-xs"><Loader2 className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
