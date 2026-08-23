'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Crown, GraduationCap, Settings, Users, Database, ShieldAlert, CheckCircle, XCircle, FileText, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { SchoolHeader } from "@/components/app/school-header";
import { Area, AreaChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { toggleUserApproval } from "@/app/actions/lms";

// --- Mock Data for Charts ---
// (Removed hardcoded mock data - now in component state)

// --- Components ---
type StatCardProps = {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: { value: string; positive: boolean };
    description?: string;
    href?: string;
}

function StatCard({ title, value, icon: Icon, trend, description, href }: StatCardProps) {
    const cardContent = (
        <Card className="h-full transition-colors hover:border-primary flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <div className="flex items-center text-xs mt-1">
                        {trend.positive ? (
                            <ArrowUpRight className="h-3 w-3 text-gold mr-1" />
                        ) : (
                            <ArrowDownRight className="h-3 w-3 text-burgundy mr-1" />
                        )}
                        <span className={trend.positive ? "text-gold" : "text-burgundy"}>
                            {trend.value}
                        </span>
                        <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                )}
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    )

    if (href) {
        return <Link href={href} className="block h-full">{cardContent}</Link>
    }
    
    return cardContent;
}

export default function AdminDashboardPage() {
    const [userName, setUserName] = React.useState('Admin');
    const [stats, setStats] = React.useState({ totalUsers: 0, pendingUsers: 0, activeCourses: 0 });
    const [pendingProfiles, setPendingProfiles] = React.useState<any[]>([]);
    const [pendingResources, setPendingResources] = React.useState<any[]>([]);
    const [storageUsed, setStorageUsed] = React.useState({ bytes: 0, formatted: "0 B", percentage: 0 });
    
    // Real-time Chart State
    const [activityData, setActivityData] = React.useState([
        { name: 'Mon', students: 0, tutors: 0 },
        { name: 'Tue', students: 0, tutors: 0 },
        { name: 'Wed', students: 0, tutors: 0 },
        { name: 'Thu', students: 0, tutors: 0 },
        { name: 'Fri', students: 0, tutors: 0 },
        { name: 'Sat', students: 0, tutors: 0 },
        { name: 'Sun', students: 0, tutors: 0 },
    ]);
    const [roleDistribution, setRoleDistribution] = React.useState([
        { name: 'Students', value: 0, color: 'hsl(var(--primary))' },
        { name: 'Tutors', value: 0, color: 'hsl(var(--chart-2))' },
        { name: 'Admins', value: 0, color: 'hsl(var(--chart-3))' },
        { name: 'Parents', value: 0, color: 'hsl(var(--chart-4))' },
    ]);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    
    // Stable client reference — never recreated on re-render
    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('loggedInUser');
            if (email) {
                const namePart = email.split('@')[0];
                const name = namePart.replace('.', ' ');
                setUserName(name.charAt(0).toUpperCase() + name.slice(1));
            }
        }
        fetchDashboardData(false);
    }, []);

    async function fetchDashboardData(showToast = false) {
        setIsRefreshing(true);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Run all queries in parallel for performance
        const [
            usersResult, 
            pendingResult, 
            coursesResult,
            studentsCount,
            tutorsCount,
            adminsCount,
            parentsCount,
            recentActivity,
            resourcesResult,
            storageUsageResult
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('id, full_name, role, updated_at, is_approved').or('is_approved.eq.false,is_approved.is.null'),
            supabase.from('courses').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'parent'),
            supabase.from('profiles').select('role, updated_at').gte('updated_at', sevenDaysAgo),
            supabase.from('resources').select(`id, title, created_at, type, tutor:profiles!tutor_id (full_name)`).eq('approval_status', 'pending_admin_review'),
            supabase.rpc('get_storage_usage')
        ]);

        setStats({
            totalUsers: usersResult.count || 0,
            pendingUsers: pendingResult.data?.length || 0,
            activeCourses: coursesResult.count || 0,
        });

        if (pendingResult.data) {
            setPendingProfiles(pendingResult.data);
        }
        if (resourcesResult.data) {
            setPendingResources(resourcesResult.data);
        }

        let totalBytes = 0;

        if (storageUsageResult && !storageUsageResult.error && storageUsageResult.data !== null) {
            totalBytes = Number(storageUsageResult.data) || 0;
        }

        const maxBytes = 1 * 1024 * 1024 * 1024; // 1 GB
        let percentage = (totalBytes / maxBytes) * 100;
        if (percentage > 100) percentage = 100;
        
        let formatted = "0 B";
        if (totalBytes >= 1024 * 1024 * 1024) {
            formatted = (totalBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        } else if (totalBytes >= 1024 * 1024) {
            formatted = (totalBytes / (1024 * 1024)).toFixed(2) + " MB";
        } else if (totalBytes >= 1024) {
            formatted = (totalBytes / 1024).toFixed(2) + " KB";
        } else if (totalBytes > 0) {
            formatted = totalBytes + " B";
        }
        
        setStorageUsed({ bytes: totalBytes, formatted, percentage });

        // Update Role Distribution Chart
        setRoleDistribution([
            { name: 'Students', value: studentsCount.count || 0, color: 'hsl(var(--primary))' },
            { name: 'Tutors', value: tutorsCount.count || 0, color: 'hsl(var(--chart-2))' },
            { name: 'Admins', value: adminsCount.count || 0, color: 'hsl(var(--chart-3))' },
            { name: 'Parents', value: parentsCount.count || 0, color: 'hsl(var(--chart-4))' },
        ]);

        // Update Activity Trend Chart
        if (recentActivity.data) {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            
            // Initialize last 7 days array
            const newActivityData: {
                name: string;
                students: number;
                tutors: number;
                dateString: string;
            }[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                newActivityData.push({
                    name: days[d.getDay()],
                    students: 0,
                    tutors: 0,
                    dateString: d.toISOString().split('T')[0]
                });
            }

            // Populate counts
            recentActivity.data.forEach(profile => {
                if (!profile.updated_at) return;
                const date = new Date(profile.updated_at).toISOString().split('T')[0];
                const dayIndex = newActivityData.findIndex(d => d.dateString === date);
                if (dayIndex !== -1) {
                    if (profile.role === 'student') newActivityData[dayIndex].students++;
                    if (profile.role === 'tutor') newActivityData[dayIndex].tutors++;
                }
            });

            setActivityData(newActivityData);
        }
        setIsRefreshing(false);
        if (showToast) {
            toast({ title: "Data Refreshed", description: "Successfully fetched the latest platform data." });
        }
    }

    const handleApproveUser = async (userId: string, isApproving: boolean) => {
        if (isApproving) {
            // Optimistic update — remove from pending list immediately
            setPendingProfiles(prev => prev.filter(p => p.id !== userId));
            setStats(prev => ({ ...prev, pendingUsers: Math.max(0, prev.pendingUsers - 1) }));

            const result = await toggleUserApproval(userId, true);
            
            if (result?.error) {
                // Fallback to client client query if server action has session context mismatch
                const { data, error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', userId).select();
                if (error || !data || data.length === 0) {
                    toast({ title: "Update Failed", description: result.error || error?.message || "Could not save approval.", variant: "destructive" });
                    fetchDashboardData(); // Revert on error
                    return;
                }
            }
            toast({ title: "User Approved", description: "The user has been granted access." });
        } else {
            // Optimistic update
            setPendingProfiles(prev => prev.filter(p => p.id !== userId));
            setStats(prev => ({ ...prev, pendingUsers: Math.max(0, prev.pendingUsers - 1), totalUsers: Math.max(0, prev.totalUsers - 1) }));

            const { data, error } = await supabase.from('profiles').delete().eq('id', userId).select();
            
            if (error || !data || data.length === 0) {
                toast({ title: "Update Failed", description: error?.message || "Could not delete user profile.", variant: "destructive" });
                fetchDashboardData(); // Revert on error
            } else {
                toast({ title: "User Rejected", description: "The user's profile has been removed." });
            }
        }
    };

    const handleApproveCourse = () => {
        toast({ title: "Feature In Progress", description: "We need to add an 'is_approved' column to your courses table first!" });
    };
    
    const handleApproveResource = async (resourceId: string, approve: boolean) => {
        const newStatus = approve ? 'approved' : 'rejected';
        setPendingResources(prev => prev.filter(r => r.id !== resourceId));
        
        const { error } = await supabase
            .from('resources')
            .update({ approval_status: newStatus })
            .eq('id', resourceId);

        if (error) {
            toast({ title: `Error processing resource`, description: error.message, variant: 'destructive' });
            fetchDashboardData(); // Revert on error
        } else {
            toast({
                title: approve ? 'Resource Approved' : 'Resource Rejected',
                description: approve
                    ? 'The resource is now available to students.'
                    : 'The resource has been rejected.',
            });
        }
    };

    const pendingCourses: any[] = [];

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Real-Time Platform Overview</h1>
                    <p className="text-muted-foreground">Welcome, {userName}! Manage operations, users, and platform health.</p>
                </div>
                <div className="flex gap-2">
                     <Button variant="outline" onClick={() => fetchDashboardData(true)} disabled={isRefreshing}>
                        {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />} 
                        {isRefreshing ? "Refreshing..." : "Refresh Data"}
                     </Button>
                </div>
            </div>

            {/* TOP METRIC CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total Registered Users" 
                    value={stats.totalUsers.toString()} 
                    icon={Users} 
                    trend={{ value: '+12%', positive: true }} 
                    href="/admin/students" 
                />
                <StatCard 
                    title="Pending Approvals" 
                    value={stats.pendingUsers.toString()} 
                    icon={ShieldAlert} 
                    trend={{ value: '-5%', positive: true }} 
                    description="Users waiting for access"
                />
                <StatCard 
                    title="Active Courses" 
                    value={stats.activeCourses.toString()} 
                    icon={FileText} 
                    trend={{ value: '+3%', positive: true }} 
                />
                <Card className="h-full transition-colors hover:border-primary flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <div className="text-2xl font-bold">{storageUsed.formatted} <span className="text-sm font-normal text-muted-foreground">/ 1 GB</span></div>
                        <Progress value={storageUsed.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">Platform media & resources</p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS ROW */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle>Activity Trend (Last 7 Days)</CardTitle>
                        <CardDescription>Daily active students and tutors on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorTutors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Area type="monotone" dataKey="students" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorStudents)" />
                                <Area type="monotone" dataKey="tutors" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorTutors)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Role Distribution</CardTitle>
                        <CardDescription>Breakdown of all registered platform users.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {roleDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 text-sm hidden lg:flex">
                            {roleDistribution.map((role) => (
                                <div key={role.name} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
                                    <span>{role.name} ({role.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PENDING ACTIONS ROW */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Administrative Actions</CardTitle>
                    <CardDescription>Review and approve new users, resources, or course publications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="users" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="users">User Approvals ({pendingProfiles.length})</TabsTrigger>
                            <TabsTrigger value="resources">Resource Approvals ({pendingResources.length})</TabsTrigger>
                            <TabsTrigger value="courses">Course Approvals ({pendingCourses.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="users">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>User Name</TableHead>
                                        <TableHead>Requested Role</TableHead>
                                        <TableHead>Date Created</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingProfiles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No users waiting for approval.</TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingProfiles.map((profile) => (
                                            <TableRow key={profile.id}>
                                                <TableCell><Badge variant="outline" className="text-gold border-gold/20 bg-gold/10">Pending</Badge></TableCell>
                                                <TableCell className="font-medium">{profile.full_name || 'Unnamed User'}</TableCell>
                                                <TableCell className="capitalize">{profile.role}</TableCell>
                                                <TableCell>{new Date(profile.updated_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" className="text-gold border-gold/20 hover:bg-gold/10" onClick={() => handleApproveUser(profile.id, true)}><CheckCircle className="mr-1 h-3 w-3"/> Approve</Button>
                                                        <Button size="sm" variant="outline" className="text-burgundy border-burgundy/20 hover:bg-burgundy/10" onClick={() => handleApproveUser(profile.id, false)}><XCircle className="mr-1 h-3 w-3"/> Reject</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                        
                        <TabsContent value="resources">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Resource Title</TableHead>
                                        <TableHead>Tutor Name</TableHead>
                                        <TableHead>Submission Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingResources.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No resources waiting for approval.</TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingResources.map((resource) => (
                                            <TableRow key={resource.id}>
                                                <TableCell><Badge variant="outline" className="text-gold border-gold/20 bg-gold/10">Review</Badge></TableCell>
                                                <TableCell className="font-medium">{resource.title}</TableCell>
                                                <TableCell>{resource.tutor?.full_name}</TableCell>
                                                <TableCell>{new Date(resource.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" className="text-gold border-gold/20 hover:bg-gold/10" onClick={() => handleApproveResource(resource.id, true)}><CheckCircle className="mr-1 h-3 w-3"/> Approve</Button>
                                                        <Button size="sm" variant="outline" className="text-burgundy border-burgundy/20 hover:bg-burgundy/10" onClick={() => handleApproveResource(resource.id, false)}><XCircle className="mr-1 h-3 w-3"/> Reject</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="courses">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Course Title</TableHead>
                                        <TableHead>Tutor Name</TableHead>
                                        <TableHead>Submission Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingCourses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell><Badge variant="outline" className="text-gold border-gold/20 bg-gold/10">Review</Badge></TableCell>
                                            <TableCell className="font-medium">{course.title}</TableCell>
                                            <TableCell>{course.tutor}</TableCell>
                                            <TableCell>{course.date}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={handleApproveCourse}><FileText className="mr-1 h-3 w-3"/> View Course</Button>
                                                    <Button size="sm" variant="outline" className="text-gold border-gold/20 hover:bg-gold/10" onClick={handleApproveCourse}><CheckCircle className="mr-1 h-3 w-3"/> Approve</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingCourses.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                No legacy courses pending. Go to the new <Link href="/admin/validation-panel" className="text-primary hover:underline">Validation Panel</Link> to review dynamic curriculum modules.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className="mt-4 flex justify-end">
                                <Link href="/admin/validation-panel">
                                    <Button>
                                        Go to Curriculum Validation Panel <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

