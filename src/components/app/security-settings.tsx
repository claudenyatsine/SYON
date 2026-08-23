'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updatePassword } from '@/app/auth/actions';
import { Shield, Key, Loader2 } from 'lucide-react';

export function SecuritySettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result?.error) {
      toast({
        variant: 'destructive',
        title: 'Error updating password',
        description: result.error,
      });
    } else {
      toast({
        title: 'Password updated',
        description: 'Your security settings have been updated successfully.',
      });
      (e.target as HTMLFormElement).reset();
    }
    setIsLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Security Settings</h2>
          <p className="text-foreground/ text-sm">Manage your password and account security.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-muted border border-border rounded-[2rem] p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Key className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Update Password</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" title="Must be at least 8 characters" className="text-foreground text-xs font-medium">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter new password"
              className="bg-muted border-none text-foreground h-12 rounded-xl placeholder:text-foreground/ focus-visible:ring-1 focus-visible:ring-white/20"
              required
              minLength={8}
            />
            <p className="text-[10px] text-foreground/">Must be at least 8 characters. We recommend a mix of letters, numbers, and symbols.</p>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-white text-obsidian hover:bg-muted rounded-full px-8 py-6 font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set New Password'}
        </Button>
      </form>

      <div className="bg-gold/10 border border-gold/20 rounded-2xl p-6">
        <p className="text-gold text-xs leading-relaxed">
          <strong>Note:</strong> If you signed up with Google, setting a password allows you to log in using your email directly in the future.
        </p>
      </div>
    </div>
  );
}

