'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCodeErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect back to login after 4 seconds
    const timer = setTimeout(() => {
      router.push('/login?error=Authentication%20failed.%20Please%20try%20logging%20in%20again.');
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-burgundy/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-muted/30 border border-border/50 backdrop-blur-md rounded-3xl p-8 text-center space-y-6 shadow-2xl relative z-10">
        <div className="w-16 h-16 bg-burgundy/10 border border-burgundy/30 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-burgundy animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Authentication Error</h1>
          <p className="text-foreground/70 text-sm">
            We encountered an issue during the authentication process. You are being redirected to the login page.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-foreground/50 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-gold" />
          <span>Redirecting to login portal...</span>
        </div>

        <Button 
          onClick={() => router.push('/login')} 
          className="w-full bg-white text-black hover:bg-white/90 rounded-full font-bold h-10 transition-transform active:scale-95"
        >
          Return to Login Now
        </Button>
      </div>
    </div>
  );
}
