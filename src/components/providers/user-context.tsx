'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  is_approved?: boolean;
  curriculum_board?: string;
  student_level?: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = React.useMemo(() => createClient(), []);
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string, userMetadata?: any, force = false) => {
    if (!force && lastFetchedUserIdRef.current === userId) {
      return;
    }
    if (!force && isFetchingRef.current === userId) {
      return;
    }

    isFetchingRef.current = userId;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile({
          ...data,
          full_name: data.full_name || userMetadata?.full_name || userMetadata?.name || '',
          avatar_url: data.avatar_url || userMetadata?.avatar_url || userMetadata?.picture || '',
          is_approved: Boolean(data.is_approved),
        });
        lastFetchedUserIdRef.current = userId;
      } else if (userMetadata) {
        // Fallback to metadata if record is missing or transient error
        setProfile((prev) => {
          if (prev && prev.id === userId) {
            return prev;
          }
          return {
            id: userId,
            full_name: userMetadata.full_name || userMetadata.name || '',
            role: userMetadata.role || 'student',
            avatar_url: userMetadata.avatar_url || userMetadata.picture || '',
            is_approved: Boolean(userMetadata.is_approved),
            curriculum_board: userMetadata.curriculum_board || undefined,
            student_level: userMetadata.student_level || undefined,
          };
        });
        if (!error) {
          lastFetchedUserIdRef.current = userId;
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      isFetchingRef.current = null;
      setLoading(false);
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, user.user_metadata, true);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser.user_metadata);
      } else {
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser.user_metadata, true);
      } else {
        setProfile(null);
        lastFetchedUserIdRef.current = null;
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Real-time synchronization on the profile table for the current user
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-profile-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updated = payload.new as any;
            setProfile((prev) => ({
              ...(prev || {}),
              ...updated,
              full_name: updated.full_name || prev?.full_name || '',
              avatar_url: updated.avatar_url || prev?.avatar_url || '',
              is_approved: Boolean(updated.is_approved),
            }));
          } else if (payload.eventType === 'DELETE') {
            setProfile(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);

  // Sync profile on window focus / tab visibility change
  useEffect(() => {
    if (!user?.id) return;

    const handleFocus = () => {
      fetchProfile(user.id, user.user_metadata, true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user?.id, user?.user_metadata, fetchProfile]);

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
