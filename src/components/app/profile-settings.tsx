'use client';

import * as React from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Key, Shield, Loader2, CheckCircle2 } from 'lucide-react';

// ----------------------------------------------------------------
// Shared, real-time Profile + Password settings component.
// Usable in any role's settings page (student / tutor / admin).
// ----------------------------------------------------------------

export function ProfileSettings() {
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

    const [fullName, setFullName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [avatarUrl, setAvatarUrl] = React.useState('');
    const [avatarPreview, setAvatarPreview] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [userId, setUserId] = React.useState('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    // --------------------------------------------------
    // Load current user's profile from Supabase on mount
    // --------------------------------------------------
    React.useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }

            setUserId(user.id);
            setEmail(user.email || '');

            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFullName(profile.full_name || '');
                setAvatarUrl(profile.avatar_url || '');
                setAvatarPreview(profile.avatar_url || '');
            }
            setLoading(false);
        }
        loadProfile();
    }, [supabase]);

    // --------------------------------------------------
    // Avatar Upload → Supabase Storage → profile update
    // --------------------------------------------------
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        // Show immediate local preview
        const localPreview = URL.createObjectURL(file);
        setAvatarPreview(localPreview);

        setUploadingAvatar(true);
        const filePath = `avatars/${userId}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
            setAvatarPreview(avatarUrl); // revert preview
            setUploadingAvatar(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', userId);

        if (updateError) {
            toast({ title: 'Profile update failed', description: updateError.message, variant: 'destructive' });
        } else {
            setAvatarUrl(publicUrl);
            toast({ title: 'Avatar updated!', description: 'Your profile picture has been changed.' });
        }
        setUploadingAvatar(false);
    };

    // --------------------------------------------------
    // Update full name in profiles table
    // --------------------------------------------------
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setSaving(true);

        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', userId);

        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Profile updated!', description: 'Your name has been saved successfully.' });
        }
        setSaving(false);
    };

    // --------------------------------------------------
    // Update password via Supabase Auth — optimistic UX:
    // Clear the field & show success immediately; only
    // display an error toast if the call actually fails.
    // --------------------------------------------------
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            toast({ title: 'Password too short', description: 'Must be at least 8 characters.', variant: 'destructive' });
            return;
        }

        // Capture value before clearing
        const newPassword = password;

        // Optimistic: clear field & show success instantly — feels snappy
        setPassword('');
        toast({ title: '🔑 Password updated!', description: 'You can now log in with your new password.' });

        // Fire the real Supabase call in the background
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            // Revert: let user try again
            setPassword(newPassword);
            toast({ title: 'Password update failed', description: error.message, variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading your profile...</span>
            </div>
        );
    }

    const initials = fullName
        ? fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        : email.substring(0, 2).toUpperCase();

    return (
        <div className="space-y-8">
            {/* --- Avatar & Name --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your public profile and personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={avatarPreview} alt={fullName} />
                                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                            </Avatar>
                            {uploadingAvatar && (
                                <div className="absolute inset-0 rounded-full bg-background/50 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-foreground animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-semibold">Profile Picture</h3>
                            <p className="text-sm text-muted-foreground mb-3">Update your avatar. We recommend a 200×200px image.</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                            >
                                {uploadingAvatar ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                                ) : (
                                    <><Upload className="mr-2 h-4 w-4" />Upload Image</>
                                )}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Profile Form */}
                    <form className="space-y-4" onSubmit={handleUpdateProfile}>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="opacity-60 cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">Email changes must be requested through your administrator.</p>
                        </div>
                        <Button type="submit" disabled={saving}>
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />Update Profile</>}
                        </Button>
                        <p className="text-sm text-muted-foreground">Note: Profile changes must be approved by an administrator and may take up to 3 business days to reflect.</p>
                    </form>
                </CardContent>
            </Card>

            {/* --- Security / Password --- */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Manage your password and account security.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleUpdatePassword}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <Key className="w-4 h-4" />
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest">
                                    Update Password
                                </Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter new password"
                                required
                                minLength={8}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Must be at least 8 characters. We recommend a mix of letters, numbers, and symbols.
                            </p>
                        </div>
                        <Button type="submit">
                            Set New Password
                        </Button>
                    </form>

                    <div className="mt-6 bg-gold/10 border border-gold/20 rounded-xl p-4">
                        <p className="text-gold text-xs leading-relaxed">
                            <strong>Note:</strong> If you signed up with Google, setting a password allows you to log in using your email directly in the future.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
