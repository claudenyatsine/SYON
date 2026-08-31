'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, GraduationCap, Search, Loader2 } from "lucide-react";
import { SchoolHeader } from "@/components/app/school-header";
import * as React from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEnrolledStudentsForSubjects, batchAssignStudentsToTutor, toggleUserApproval } from "@/app/actions/lms";
import { CurriculumBoardBadge, SubjectLevelBadge } from "@/components/app/subject-badge";
import { getCurriculumBoard, getSubjectLevel } from "@/utils/subject-utils";

const INVITE_LINK = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/invite/tutor-a1b2-c3d4-e5f6`;

function TutorListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
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

export default function TutorsPage() {
    const [tutors, setTutors] = React.useState<any[]>([]);
    const [subjects, setSubjects] = React.useState<any[]>([]);
    const [tutorSubjects, setTutorSubjects] = React.useState<Record<string, string[]>>({});
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "active">("all");

    // Dialog state
    const [selectedTutor, setSelectedTutor] = React.useState<any>(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
    
    // Subjects Tab State
    const [tempSelectedSubjects, setTempSelectedSubjects] = React.useState<string[]>([]);
    
    // Students Tab State
    const [enrolledStudents, setEnrolledStudents] = React.useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = React.useState(false);
    const [tempAssignedStudents, setTempAssignedStudents] = React.useState<string[]>([]);
    const [originalAssignedStudents, setOriginalAssignedStudents] = React.useState<string[]>([]);
    
    const [isSaving, setIsSaving] = React.useState(false);

    // Stable Supabase client — not recreated on every render
    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    const fetchTutorsAndSubjects = React.useCallback(async () => {
        setLoading(true);
        const [{ data: tutorsData, error: tutorsError }, { data: subData }, { data: tsData }] = await Promise.all([
            supabase.from('profiles').select('id, full_name, email, avatar_url, role, is_approved, updated_at').eq('role', 'tutor').order('updated_at', { ascending: false }),
            supabase.from('subjects').select('*'),
            supabase.from('tutor_subjects').select('*')
        ]);

        if (tutorsError) {
            toast({ title: "Error fetching tutors", description: tutorsError.message, variant: "destructive" });
        } else {
            setTutors(tutorsData || []);
        }

        if (subData) {
            setSubjects(subData);
        }

        if (tsData) {
            const mapping: Record<string, string[]> = {};
            tsData.forEach((ts: any) => {
                if (!mapping[ts.tutor_id]) mapping[ts.tutor_id] = [];
                mapping[ts.tutor_id].push(ts.subject_id);
            });
            setTutorSubjects(mapping);
        }

        setLoading(false);
    }, [supabase, toast]);

    React.useEffect(() => {
        fetchTutorsAndSubjects();

        const channel = supabase
            .channel('admin-tutors-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: 'role=eq.tutor',
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTutors(prev => [payload.new as any, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setTutors(prev =>
                        prev.map(t => t.id === (payload.new as any).id ? { ...t, ...(payload.new as any) } : t)
                    );
                } else if (payload.eventType === 'DELETE') {
                    setTutors(prev => prev.filter(t => t.id !== (payload.old as any).id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchTutorsAndSubjects, supabase]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(INVITE_LINK);
        toast({ title: "Link Copied!", description: "Tutor invitation link has been copied to your clipboard." });
    };

    const toggleApproveTutor = async (tutorId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        // Optimistic update
        setTutors(prev => prev.map(t => t.id === tutorId ? { ...t, is_approved: newStatus } : t));

        const result = await toggleUserApproval(tutorId, newStatus);

        if (result?.error) {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: newStatus })
                .eq('id', tutorId);

            if (error) {
                // Revert on error
                setTutors(prev => prev.map(t => t.id === tutorId ? { ...t, is_approved: currentStatus } : t));
                toast({ title: "Error updating status", description: result.error || error.message, variant: "destructive" });
                return;
            }
        }

        toast({
            title: newStatus ? "Tutor Approved" : "Tutor Access Suspended",
            description: `Successfully updated the tutor's access status.`,
        });
    };

    const openAssignDialog = async (tutor: any) => {
        setSelectedTutor(tutor);
        const assignedSubjectIds = tutorSubjects[tutor.id] || [];
        setTempSelectedSubjects(assignedSubjectIds);
        setIsAssignDialogOpen(true);
    };

    React.useEffect(() => {
        if (!isAssignDialogOpen || !selectedTutor) return;

        const fetchStudents = async () => {
            if (tempSelectedSubjects.length > 0) {
                setLoadingStudents(true);
                const { data } = await getEnrolledStudentsForSubjects(tempSelectedSubjects);
                if (data) {
                    setEnrolledStudents(data);
                    const currentlyAssigned = data.filter((e: any) => e.tutor_id === selectedTutor.id).map((e: any) => e.id);
                    // Only update original once per dialog open
                    setOriginalAssignedStudents(prev => prev.length === 0 ? currentlyAssigned : prev);
                    setTempAssignedStudents(currentlyAssigned);
                }
                setLoadingStudents(false);
            } else {
                setEnrolledStudents([]);
                setTempAssignedStudents([]);
            }
        };

        fetchStudents();
    }, [tempSelectedSubjects, isAssignDialogOpen, selectedTutor]);

    const handleSubjectToggle = (subjectId: string) => {
        setTempSelectedSubjects(prev => 
            prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
        );
    };

    const handleStudentToggle = (enrollmentId: string) => {
        setTempAssignedStudents(prev => 
            prev.includes(enrollmentId) ? prev.filter(id => id !== enrollmentId) : [...prev, enrollmentId]
        );
    };

    const saveAssignments = async () => {
        if (!selectedTutor) return;
        setIsSaving(true);
        
        // 1. Save Subjects
        await supabase.from('tutor_subjects').delete().eq('tutor_id', selectedTutor.id);
        if (tempSelectedSubjects.length > 0) {
            const inserts = tempSelectedSubjects.map(subId => ({
                tutor_id: selectedTutor.id,
                subject_id: subId
            }));
            const { error } = await supabase.from('tutor_subjects').insert(inserts);
            if (error) {
                toast({ title: "Error assigning subjects", description: error.message, variant: "destructive" });
                setIsSaving(false);
                return;
            }
        }
        setTutorSubjects(prev => ({ ...prev, [selectedTutor.id]: tempSelectedSubjects }));
        
        // 2. Save Students
        const toAssign = tempAssignedStudents.filter(id => !originalAssignedStudents.includes(id));
        const toUnassign = originalAssignedStudents.filter(id => !tempAssignedStudents.includes(id));
        
        if (toAssign.length > 0 || toUnassign.length > 0) {
            const result = await batchAssignStudentsToTutor(toAssign, toUnassign, selectedTutor.id);
            if (result.error) {
                toast({ title: "Error assigning students", description: result.error, variant: "destructive" });
            }
        }

        toast({ title: "Assignments Saved", description: `Successfully updated subjects and students for ${selectedTutor.full_name}.` });
        setIsSaving(false);
        setIsAssignDialogOpen(false);
    };

    const filteredTutors = React.useMemo(() => tutors.filter(tutor => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = (tutor.full_name || "").toLowerCase().includes(query) ||
                             (tutor.email || "").toLowerCase().includes(query);
        const isApproved = !!tutor.is_approved;

        if (!matchesQuery) return false;
        if (statusFilter === "pending") return !isApproved;
        if (statusFilter === "active") return isApproved;
        return true;
    }), [tutors, searchQuery, statusFilter]);

    const pendingCount = React.useMemo(() => tutors.filter(t => !t.is_approved).length, [tutors]);

    // Group students by subject for the Students Tab
    const studentsBySubject = React.useMemo(() => {
        const groups: Record<string, { subjectName: string, enrollments: any[] }> = {};
        enrolledStudents.forEach(e => {
            if (!groups[e.subject_id]) {
                groups[e.subject_id] = { subjectName: e.subjects?.name || 'Unknown', enrollments: [] };
            }
            groups[e.subject_id].enrollments.push(e);
        });
        return groups;
    }, [enrolledStudents]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Tutor Management</h1>
                    <p className="text-muted-foreground">View, search, and manage all tutors in your school.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Tabs value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
                        <TabsList className="h-9">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="pending" className="text-xs">
                                Pending {pendingCount > 0 && `(${pendingCount})`}
                            </TabsTrigger>
                            <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search tutors..." 
                            className="pl-9 min-w-[200px] h-9 text-xs" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <Card><CardContent className="pt-6"><TutorListSkeleton /></CardContent></Card>
            ) : tutors.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <GraduationCap className="h-16 w-16 text-muted-foreground" />
                        <h3 className="text-2xl font-bold tracking-tight">No Tutors Invited</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Use the invitation link below to invite tutors to your school. Once they accept, they will appear in your tutor list.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <Input readOnly value={INVITE_LINK} className="h-9 text-xs min-w-[280px]" />
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleCopyLink}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy link</span>
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>All Tutors</CardTitle>
                                <CardDescription>A total of {tutors.length} tutors registered.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Invite Link:</span>
                                <Input readOnly value={INVITE_LINK} className="h-8 text-xs w-[200px]" />
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopyLink}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="!pt-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tutor</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Assigned Subjects</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTutors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                            No tutors match your search query.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTutors.map((tutor) => (
                                        <TableRow key={tutor.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={tutor.avatar_url} alt={tutor.full_name || 'Tutor'} />
                                                        <AvatarFallback>
                                                            {(tutor.full_name || 'T').split(' ').map((n: string) => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{tutor.full_name || 'Unnamed Tutor'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{tutor.email}</TableCell>
                                            <TableCell>{tutor.updated_at ? new Date(tutor.updated_at).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-[240px]">
                                                    {(tutorSubjects[tutor.id] || []).length === 0 ? (
                                                        <span className="text-xs text-muted-foreground italic">None</span>
                                                    ) : (
                                                        <>
                                                            {(tutorSubjects[tutor.id] || []).slice(0, 2).map(subId => {
                                                                const sub = subjects.find(s => s.id === subId);
                                                                if (!sub) return null;
                                                                const board = getCurriculumBoard(sub);
                                                                return (
                                                                    <div key={subId} className="flex items-center gap-1 bg-muted/60 px-1.5 py-0.5 rounded border text-[10px] truncate max-w-[180px]">
                                                                        <span className="text-[8px] font-bold px-1 rounded bg-gold/15 text-gold">{board}</span>
                                                                        <span className="truncate font-medium">{sub.name}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                            {(tutorSubjects[tutor.id] || []).length > 2 && (
                                                                <Badge variant="secondary" className="text-[10px] font-normal px-1 py-0 h-4">+{tutorSubjects[tutor.id].length - 2} more</Badge>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {tutor.is_approved ? (
                                                    <Badge className="bg-gold/10 text-gold hover:bg-gold/20">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-gold border-gold/20 bg-gold/10">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => openAssignDialog(tutor)}>
                                                        Manage Assignments
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className={tutor.is_approved ? "text-burgundy border-burgundy/20 hover:bg-burgundy/10" : "text-gold border-gold/20 hover:bg-gold/10"}
                                                        onClick={() => toggleApproveTutor(tutor.id, tutor.is_approved)}
                                                    >
                                                        {tutor.is_approved ? "Suspend" : "Approve"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Assign Modal */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle>Manage Tutor Assignments</DialogTitle>
                        <DialogDescription>
                            Assign subjects to <span className="font-semibold text-foreground">{selectedTutor?.full_name}</span> and link students who are enrolled in those subjects.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4 flex-1 overflow-hidden flex flex-col">
                        <Tabs defaultValue="subjects" className="flex-1 flex flex-col overflow-hidden">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="subjects">Subjects ({tempSelectedSubjects.length})</TabsTrigger>
                                <TabsTrigger value="students">Assigned Students</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="subjects" className="flex-1 overflow-y-auto">
                                <div className="space-y-3 pr-1">
                                    {subjects.length === 0 ? (
                                        <p className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg">No subjects found in the database.</p>
                                    ) : (
                                        subjects.map(subject => (
                                            <div key={subject.id} className="flex items-center space-x-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                                                <Checkbox 
                                                    id={`subject-${subject.id}`} 
                                                    checked={tempSelectedSubjects.includes(subject.id)}
                                                    onCheckedChange={() => handleSubjectToggle(subject.id)}
                                                    className="w-5 h-5"
                                                />
                                                <Label htmlFor={`subject-${subject.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1 flex items-center justify-between gap-2 flex-wrap">
                                                    <span className="font-bold">{subject.name}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <CurriculumBoardBadge board={getCurriculumBoard(subject)} size="sm" />
                                                        <SubjectLevelBadge level={getSubjectLevel(subject)} size="sm" />
                                                    </div>
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="students" className="flex-1 overflow-y-auto">
                                {loadingStudents ? (
                                    <div className="flex items-center justify-center h-40">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : tempSelectedSubjects.length === 0 ? (
                                    <div className="p-8 text-center border border-dashed rounded-lg bg-muted/20">
                                        <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-sm text-muted-foreground">Assign subjects first to see enrolled students.</p>
                                    </div>
                                ) : enrolledStudents.length === 0 ? (
                                    <div className="p-8 text-center border border-dashed rounded-lg bg-muted/20">
                                        <p className="text-sm text-muted-foreground">No students are currently enrolled in these subjects.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(studentsBySubject).map(([subId, group]) => (
                                            <div key={subId} className="space-y-3">
                                                <h4 className="font-semibold text-sm border-b pb-2 flex items-center justify-between">
                                                    {group.subjectName}
                                                    <Badge variant="secondary" className="text-[10px]">{group.enrollments.length} Enrolled</Badge>
                                                </h4>
                                                <div className="space-y-2">
                                                    {group.enrollments.map(enrollment => {
                                                        const isChecked = tempAssignedStudents.includes(enrollment.id);
                                                        const isAssignedToOther = enrollment.tutor_id && enrollment.tutor_id !== selectedTutor.id;
                                                        return (
                                                            <div key={enrollment.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                                                                <Checkbox 
                                                                    id={`student-${enrollment.id}`} 
                                                                    checked={isChecked}
                                                                    onCheckedChange={() => handleStudentToggle(enrollment.id)}
                                                                />
                                                                <div className="flex-1">
                                                                    <Label htmlFor={`student-${enrollment.id}`} className="text-sm font-medium leading-none cursor-pointer flex flex-col gap-1.5">
                                                                        <span>{enrollment.profiles?.full_name || 'Unnamed Student'}</span>
                                                                        <span className="text-muted-foreground text-xs font-normal">{enrollment.profiles?.email}</span>
                                                                    </Label>
                                                                </div>
                                                                {isAssignedToOther && !isChecked && (
                                                                    <Badge variant="outline" className="text-[10px] text-gold border-gold/20 bg-gold/10 shrink-0">Assigned Elsewhere</Badge>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t bg-muted/10 shrink-0">
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={saveAssignments} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isSaving ? "Saving..." : "Save Assignments"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

