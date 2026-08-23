'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const supabase = createClient();
  const lastFetchedUserIdRef = React.useRef<string | null>(null);
  const isFetchingRef = React.useRef<string | null>(null);

  const fetchProfile = async (userId: string, userMetadata?: any, force = false) => {
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
        });
        lastFetchedUserIdRef.current = userId;
      } else if (userMetadata) {
        // Fallback to metadata if record is missing
        setProfile({
          id: userId,
          full_name: userMetadata.full_name || userMetadata.name || '',
          role: userMetadata.role || 'student',
          avatar_url: userMetadata.avatar_url || userMetadata.picture || '',
          is_approved: userMetadata.is_approved ?? false,
          curriculum_board: userMetadata.curriculum_board || undefined,
          student_level: userMetadata.student_level || undefined,
        });
        lastFetchedUserIdRef.current = userId;
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      isFetchingRef.current = null;
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.user_metadata, true);
    }
  };

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
        await fetchProfile(currentUser.id, currentUser.user_metadata);
      } else {
        setProfile(null);
        lastFetchedUserIdRef.current = null;
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
