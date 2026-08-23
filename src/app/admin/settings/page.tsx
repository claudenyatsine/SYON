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
                <CardDescription>Configure how platform alerts reach you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {[
                    { id: 'new-user', label: 'New User Registrations', desc: 'Get notified whenever a new user registers and requires approval.', defaultChecked: true },
                    { id: 'course-submissions', label: 'Course Submissions', desc: 'Be alerted when a tutor submits a new course for review.', defaultChecked: true },
                    { id: 'billing-alerts', label: 'Billing Alerts', desc: 'Receive alerts for payment failures or subscription changes.', defaultChecked: true },
                    { id: 'newsletter', label: 'Platform Updates', desc: 'Stay informed about new Dr Max platform features.', defaultChecked: false },
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
                <CardDescription>Manage your administrator account and data.</CardDescription>
            </CardHeader>
            <CardContent>
                <Card className="border-destructive bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription className="text-destructive/80">Permanently delete this admin account. This action cannot be undone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive">Delete Admin Account</Button>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}

export default function AdminSettingsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your administrator account and preferences.</p>
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
