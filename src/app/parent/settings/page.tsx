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
                <CardDescription>Choose how you want to be notified about your child's activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {[
                    { id: 'grade-updates', label: 'Grade Updates', desc: "Get notified when your child receives a new grade.", defaultChecked: true },
                    { id: 'attendance', label: 'Attendance Alerts', desc: 'Be alerted if your child misses a live class.', defaultChecked: true },
                    { id: 'progress-reports', label: 'Weekly Progress Reports', desc: 'Receive a weekly summary of your child\'s academic progress.', defaultChecked: true },
                    { id: 'newsletter', label: 'School Announcements', desc: 'Stay informed about school news and upcoming events.', defaultChecked: false },
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

function AccountSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your parent account and data.</CardDescription>
            </CardHeader>
            <CardContent>
                <Card className="border-destructive bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Delete Account</CardTitle>
                        <CardDescription className="text-destructive/80">Permanently delete your parent account. This will not affect your child's student account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive">Delete My Account</Button>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}

export default function ParentSettingsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your parent account and notification preferences.</p>
            </div>
            <Tabs defaultValue="profile">
                <TabsList className="mb-6">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <ProfileSettings />
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
