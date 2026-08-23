'use client';

import { useUser } from '@/components/providers/user-context';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

export function PreviewBanner() {
  const { profile, loading } = useUser();

  if (loading || !profile || profile.is_approved) {
    return null;
  }

  return (
    <div className="bg-gold/15 border-b border-gold/30 text-gold dark:text-gold px-4 py-3 text-sm flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      <span className="font-medium">Preview Mode:</span>
      <span>Your account is pending admin approval. You have limited access to materials and features.</span>
    </div>
  );
}
