
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Shield, User, Bell, CreditCard, KeyRound, Briefcase, DollarSign, Banknote, Download } from 'lucide-react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import images from '@/lib/placeholder-images.json';

const transactionHistory = [
    { id: 'txn_1', date: '2024-07-20', description: 'Payout to Bank Account', amount: '+$1,200.00', status: 'Completed' },
    { id: 'txn_2', date: '2024-07-18', description: 'Platform Fee', amount: '-$120.00', status: 'Completed' },
    { id: 'txn_3', date: '2024-07-15', description: 'Payment from Class: Algebra 101', amount: '+$150.00', status: 'Completed' },
    { id: 'txn_4', date: '2024-07-12', description: 'Payment from Tutoring Session', amount: '+$50.00', status: 'Completed' },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('account');
  return (
    <div className="w-full">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Tutor Settings</h1>
          <p className="text-muted-foreground">Manage your account, professional profile, and payout settings.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
              <Card>
                  <CardContent className="p-4">
                      <nav className="flex flex-col space-y-1">
                          <Button variant={activeTab === 'account' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('account')} className="justify-start">
                              <User className="mr-2 h-4 w-4" />
                              Profile
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
                              Earnings
                          </Button>
                      </nav>
                  </CardContent>
              </Card>
          </div>

          <div className="lg:col-span-3">
              {activeTab === 'account' && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Tutor Profile</CardTitle>
                          <CardDescription>This information will be displayed on your public tutor profile.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="flex items-center gap-6">
                              <Avatar className="h-20 w-20">
                                  <AvatarImage src={images.avatar1.src} alt="User avatar" />
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
                                  <Input id="fullName" defaultValue="Anya Sharma" />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" type="email" defaultValue="anya.sharma@example.com" disabled />
                              </div>
                              <div className="space-y-2 sm:col-span-2">
                                  <Label htmlFor="title">Title / Headline</Label>
                                  <Input id="title" placeholder="e.g. Senior Math & Physics Tutor" />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="experience">Years of Experience</Label>
                                  <Input id="experience" type="number" placeholder="e.g. 5" />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="rate">Hourly Rate ($)</Label>
                                  <Input id="rate" type="number" placeholder="e.g. 50" />
                              </div>
                              <div className="space-y-2 sm:col-span-2">
                                  <Label htmlFor="expertise">Expertise / Subjects</Label>
                                  <Input id="expertise" placeholder="e.g. Mathematics, Physics, Computer Science" />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="phone">Phone Number</Label>
                                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="website">Website / Portfolio</Label>
                                  <Input id="website" placeholder="https://your-portfolio.com" />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="bio">Bio</Label>
                              <textarea id="bio" rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Tell students about your teaching philosophy, experience, and what makes you a great tutor..."></textarea>
                          </div>
                      </CardContent>
                  </Card>
              )}
              {activeTab === 'notifications' && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Notifications</CardTitle>
                          <CardDescription>Manage how you receive notifications about student activity.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                              <h3 className="font-medium">By Email</h3>
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div>
                                      <p className="font-medium">New Student Messages</p>
                                      <p className="text-sm text-muted-foreground">Notify me when a student sends you a direct message.</p>
                                  </div>
                                  <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div>
                                      <p className="font-medium">New Forum Posts</p>
                                      <p className="text-sm text-muted-foreground">Notify me when a student posts in a forum you manage.</p>
                                  </div>
                                  <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div>
                                      <p className="font-medium">Class Booking Confirmations</p>
                                      <p className="text-sm text-muted-foreground">Notify me when a student books a live class.</p>
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
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$12,540.00</div>
                                <p className="text-xs text-muted-foreground">All-time earnings</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
                                <Banknote className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$1,200.00</div>
                                <p className="text-xs text-muted-foreground">Scheduled for August 1, 2024</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                      <CardHeader>
                          <CardTitle>Payout Methods</CardTitle>
                          <CardDescription>Manage your bank accounts for receiving payments.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="flex items-center justify-between rounded-lg border p-4">
                              <div className="flex items-center gap-3">
                                  <Briefcase className="h-6 w-6"/>
                                  <div>
                                      <p className="font-medium">Bank of America</p>
                                      <p className="text-sm text-muted-foreground">Checking Account ending in 1234</p>
                                  </div>
                              </div>
                              <Button variant="ghost" size="sm">Remove</Button>
                          </div>
                          <Button>Add Payout Method</Button>
                      </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>View your recent payouts and platform fees.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4"/>
                                Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactionHistory.map(txn => (
                                        <TableRow key={txn.id}>
                                            <TableCell>{txn.date}</TableCell>
                                            <TableCell>{txn.description}</TableCell>
                                            <TableCell className={`text-right font-medium ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{txn.amount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
