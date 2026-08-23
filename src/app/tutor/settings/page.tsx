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
