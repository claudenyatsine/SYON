'use client';

import { ProfileSettings } from '@/components/app/profile-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function NotificationSettings() {
    return (
         <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose how you want to be notified about activity on Dr Max.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {[
                    { id: 'new-assignment', label: 'New Assignments', desc: 'Get notified when a student submits an assignment.', defaultChecked: true },
                    { id: 'class-reminders', label: 'Class Reminders', desc: 'Receive reminders 15 minutes before your live class starts.', defaultChecked: true },
                    { id: 'student-messages', label: 'Student Messages', desc: 'Get notified when a student sends you a message.', defaultChecked: true },
                    { id: 'newsletter', label: 'Product Updates', desc: 'Receive our monthly newsletter with the latest features.', defaultChecked: false },
                ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label htmlFor={item.id} className="font-medium">{item.label}</Label>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch id={item.id} defaultChecked={item.defaultChecked} />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';

function AppearanceSettings() {
    const { theme, setTheme } = useTheme();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your app on this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                            theme === 'dark' 
                                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-foreground ring-1 ring-[#D4AF37]' 
                                : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                        }`}
                    >
                        <Moon className="w-6 h-6 text-[#D4AF37]" />
                        <div className="text-center">
                            <p className="text-sm font-bold text-foreground">Dark Theme</p>
                            <p className="text-xs text-muted-foreground">Default sleek dark mode</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                            theme === 'light' 
                                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-foreground ring-1 ring-[#D4AF37]' 
                                : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                        }`}
                    >
                        <Sun className="w-6 h-6 text-amber-500" />
                        <div className="text-center">
                            <p className="text-sm font-bold text-foreground">Light Theme</p>
                            <p className="text-xs text-muted-foreground">Clean light interface</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTheme('system')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                            theme === 'system' 
                                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-foreground ring-1 ring-[#D4AF37]' 
                                : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                        }`}
                    >
                        <Monitor className="w-6 h-6 text-blue-400" />
                        <div className="text-center">
                            <p className="text-sm font-bold text-foreground">System Default</p>
                            <p className="text-xs text-muted-foreground">Follow OS settings</p>
                        </div>
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

function AccountSettings() {
    return (
         <Card>
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings and data.</CardDescription>
            </CardHeader>
             <CardContent>
                 <Card className="border-destructive bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Delete Account</CardTitle>
                        <CardDescription className="text-destructive/80">Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive">Delete My Account</Button>
                    </CardContent>
                 </Card>
            </CardContent>
        </Card>
    );
}

export default function TutorSettingsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>
            <Tabs defaultValue="profile">
                <TabsList className="mb-6 flex-wrap">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <ProfileSettings />
                </TabsContent>
                <TabsContent value="appearance">
                    <AppearanceSettings />
                </TabsContent>
                <TabsContent value="notifications">
                    <NotificationSettings />
                </TabsContent>
                <TabsContent value="account">
                    <AccountSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
