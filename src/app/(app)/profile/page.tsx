
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Shield, User, Bell, CreditCard, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('account');
  return (
    <div className="w-full">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account, preferences, and notifications.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
              <Card>
                  <CardContent className="p-4">
                      <nav className="flex flex-col space-y-1">
                          <Button variant={activeTab === 'account' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('account')} className="justify-start">
                              <User className="mr-2 h-4 w-4" />
                              Account
                          </Button>
                          <Button variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('notifications')} className="justify-start">
                              <Bell className="mr-2 h-4 w-4" />
                              Notifications
                          </Button>
                          <Button variant={activeTab === 'security' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('security')} className="justify-start">
                              <Shield className="mr-2 h-4 w-4" />
                              Security
                          </Button>
                          <Button variant={activeTab === 'billing' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('billing')} className="justify-start">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Billing
                          </Button>
                      </nav>
                  </CardContent>
              </Card>
          </div>

          <div className="lg:col-span-3">
              {activeTab === 'account' && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Profile</CardTitle>
                          <CardDescription>This information will be displayed publicly.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="flex items-center gap-6">
                              <Avatar className="h-20 w-20">
                                  <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" />
                                  <AvatarFallback>A</AvatarFallback>
                              </Avatar>
                              <div className="flex gap-2">
                                  <Button>Change</Button>
                                  <Button variant="outline">Remove</Button>
                              </div>
                          </div>
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <div className="space-y-2">
                                  <Label htmlFor="fullName">Full Name</Label>
                                  <Input id="fullName" defaultValue="Alex Doe" />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" type="email" defaultValue="alex.doe@example.com" disabled />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="grade">Grade</Label>
                                  <Select>
                                    <SelectTrigger id="grade">
                                        <SelectValue placeholder="Select your grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                                                Grade {i + 1}
                                            </SelectItem>
                                        ))}
                                         <SelectItem value="higher-ed">Higher Education</SelectItem>
                                    </SelectContent>
                                  </Select>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="subjects">Subjects</Label>
                                  <Input id="subjects" placeholder="e.g. Math, Physics" />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="phone">Phone Number</Label>
                                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="address">Address</Label>
                                  <Input id="address" placeholder="123 Main St, Anytown, USA" />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="bio">Bio</Label>
                              <textarea id="bio" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Tell us a little about yourself..."></textarea>
                          </div>
                      </CardContent>
                  </Card>
              )}
              {activeTab === 'notifications' && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Notifications</CardTitle>
                          <CardDescription>Manage how you receive notifications.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                              <h3 className="font-medium">By Email</h3>
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div>
                                      <p className="font-medium">New Messages</p>
                                      <p className="text-sm text-muted-foreground">Notify me when I receive a new direct message.</p>
                                  </div>
                                  <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div>
                                      <p className="font-medium">Forum Mentions</p>
                                      <p className="text-sm text-muted-foreground">Notify me when someone mentions me in a forum.</p>
                                  </div>
                                  <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div>
                                      <p className="font-medium">Class Reminders</p>
                                      <p className="text-sm text-muted-foreground">Remind me about upcoming live classes.</p>
                                  </div>
                                  <Switch />
                              </div>
                          </div>
                          <Separator />
                          <div className="space-y-4">
                              <h3 className="font-medium">Push Notifications</h3>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div>
                                      <p className="font-medium">Everything</p>
                                      <p className="text-sm text-muted-foreground">Receive push notifications for all activities.</p>
                                  </div>
                                  <Switch />
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              )}
              {activeTab === 'security' && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Security</CardTitle>
                          <CardDescription>Manage your password and security settings.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <Label htmlFor="currentPassword">Current Password</Label>
                                  <Input id="currentPassword" type="password" />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="newPassword">New Password</Label>
                                  <Input id="newPassword" type="password" />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                  <Input id="confirmPassword" type="password" />
                              </div>
                              <Button>Update Password</Button>
                          </div>
                          <Separator />
                          <div className="space-y-4">
                              <h3 className="font-medium">Two-Factor Authentication</h3>
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div>
                                      <p className="font-medium">Enable 2FA</p>
                                      <p className="text-sm text-muted-foreground">Secure your account with an extra layer of protection.</p>
                                  </div>
                                  <Button variant="outline">Setup</Button>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              )}
              {activeTab === 'billing' && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Billing</CardTitle>
                          <CardDescription>Manage your subscription and payment methods.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="rounded-lg border p-4">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h3 className="font-semibold">Pro Plan</h3>
                                      <p className="text-sm text-muted-foreground">Renews on August 29, 2025</p>
                                  </div>
                                  <p className="font-semibold">$15/month</p>
                              </div>
                              <Separator className="my-4" />
                              <div className="flex justify-end gap-2">
                                  <Button variant="outline">Change Plan</Button>
                                  <Button variant="destructive">Cancel Subscription</Button>
                              </div>
                          </div>

                          <div>
                              <h3 className="font-semibold">Payment Methods</h3>
                              <div className="mt-4 space-y-4">
                                  <div className="flex items-center justify-between rounded-lg border p-4">
                                      <div className="flex items-center gap-3">
                                          <CreditCard className="h-6 w-6"/>
                                          <div>
                                              <p className="font-medium">Visa ending in 1234</p>
                                              <p className="text-sm text-muted-foreground">Expires 08/2026</p>
                                          </div>
                                      </div>
                                      <Button variant="ghost" size="sm">Remove</Button>
                                  </div>
                                  <Button>Add Payment Method</Button>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
