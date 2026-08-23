'use server';

import { createClient } from '@/utils/supabase/server';

export async function awardGamificationPoints(points: number) {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { error: 'Not authenticated' };
    }

    try {
        // Try calling the RPC function we added in the migration
        const { error } = await supabase.rpc('award_points', {
            user_id: user.id,
            points: points
        });

        if (error) {
            // Fallback: If migration wasn't run yet, just do a normal update (this is subject to race conditions but works as fallback)
            console.warn('RPC failed, falling back to direct update:', error.message);
            const { data: profile } = await supabase.from('profiles').select('gamification_score').eq('id', user.id).single();
            const currentScore = profile?.gamification_score || 0;
            
            await supabase.from('profiles').update({
                gamification_score: currentScore + points
            }).eq('id', user.id);
        }

        return { success: true };
    } catch (e: any) {
        console.error('Failed to award points', e);
        return { error: e.message };
    }
}
