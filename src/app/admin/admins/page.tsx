'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import * as React from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, ShieldAlert } from "lucide-react";

const INVITE_LINK = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/invite/admin-x9y8-z7w6`;

function AdminListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-52" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            ))}
        </div>
    );
}

function AdminList() {
    const [admins, setAdmins] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Stable Supabase client — not recreated on every render
    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    const fetchAdmins = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url, role, is_approved, updated_at')
            .eq('role', 'admin')
            .order('updated_at', { ascending: false });

        if (error) {
            toast({ title: "Error fetching admins", description: error.message, variant: "destructive" });
        } else {
            setAdmins(data || []);
        }
        setLoading(false);
    }, [supabase, toast]);

    React.useEffect(() => {
        fetchAdmins();

        const channel = supabase
            .channel('admin-admins-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: 'role=eq.admin',
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setAdmins(prev => [payload.new as any, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setAdmins(prev =>
                        prev.map(a => a.id === (payload.new as any).id ? { ...a, ...(payload.new as any) } : a)
                    );
                } else if (payload.eventType === 'DELETE') {
                    setAdmins(prev => prev.filter(a => a.id !== (payload.old as any).id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchAdmins, supabase]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(INVITE_LINK);
        toast({ title: "Link Copied!", description: "Admin invitation link has been copied to your clipboard." });
    };

    const toggleApproveAdmin = async (adminId: string, currentStatus: boolean) => {
        // Optimistic update — instant UI response, no waiting for refetch
        setAdmins(prev =>
            prev.map(a => a.id === adminId ? { ...a, is_approved: !currentStatus } : a)
        );

        const { error } = await supabase
            .from('profiles')
            .update({ is_approved: !currentStatus })
            .eq('id', adminId);

        if (error) {
            // Revert on error
            setAdmins(prev =>
                prev.map(a => a.id === adminId ? { ...a, is_approved: currentStatus } : a)
            );
            toast({ title: "Error updating status", description: error.message, variant: "destructive" });
        } else {
            toast({
                title: !currentStatus ? "Admin Approved" : "Admin Access Suspended",
                description: `Successfully updated the administrator's access status.`,
            });
        }
    };

    const filteredAdmins = React.useMemo(() => admins.filter(admin => {
        const query = searchQuery.toLowerCase();
        return (admin.full_name || "").toLowerCase().includes(query) ||
               (admin.email || "").toLowerCase().includes(query);
    }), [admins, searchQuery]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>All Administrators</CardTitle>
                        <CardDescription>A list of all administrators for your institution.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Invite Link:</span>
                            <Input readOnly value={INVITE_LINK} className="h-8 text-xs w-[180px]" />
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopyLink}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="relative mt-2 sm:mt-0 ml-0 sm:ml-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search admins..." 
                                className="pl-9 min-w-[200px] h-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="!pt-0">
                {loading ? (
                    <AdminListSkeleton />
                ) : (
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Administrator</TableHead>
                                    <TableHead>Role Type</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAdmins.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            {searchQuery ? (
                                                "No administrators match your search query."
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <ShieldAlert className="h-10 w-10 text-muted-foreground/50" />
                                                    <p>No other administrators found.</p>
                                                    <p className="text-xs">Use the invite link above to add administrators.</p>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAdmins.map((admin) => (
                                        <TableRow key={admin.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={admin.avatar_url} alt={admin.full_name || 'Admin'} />
                                                        <AvatarFallback>
                                                            {(admin.full_name || 'A').split(' ').map((n: string) => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{admin.full_name || 'Unnamed Admin'}</div>
                                                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{admin.role}</TableCell>
                                            <TableCell>{admin.updated_at ? new Date(admin.updated_at).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>
                                                {admin.is_approved ? (
                                                    <Badge className="bg-gold/10 text-gold hover:bg-gold/20">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-gold border-gold/20 bg-gold/10">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className={admin.is_approved ? "text-burgundy border-burgundy/20 hover:bg-burgundy/10" : "text-gold border-gold/20 hover:bg-gold/10"}
                                                    onClick={() => toggleApproveAdmin(admin.id, admin.is_approved)}
                                                >
                                                    {admin.is_approved ? "Suspend" : "Approve"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function AdminsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Administrator Management</h1>
                <p className="text-muted-foreground">View, search, and manage platform administrators.</p>
            </div>
            <AdminList />
        </div>
    );
}

