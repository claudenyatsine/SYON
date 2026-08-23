'use client';

import * as React from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Settings, BookOpen, BookPlus, BookMinus, UserX, Loader2, AlertTriangle, CheckCircle2, Users
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Student {
    id: string;
    full_name: string;
    avatar_url?: string;
    is_approved: boolean;
}

interface ManageStudentDialogProps {
    student: Student;
    onStudentRemoved?: (studentId: string) => void;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export function ManageStudentDialog({ student, onStudentRemoved }: ManageStudentDialogProps) {
    const [open, setOpen] = React.useState(false);
    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    const [allCourses, setAllCourses] = React.useState<any[]>([]);
    const [enrollmentsList, setEnrollmentsList] = React.useState<any[]>([]);
    const [togglingId, setTogglingId] = React.useState<string | null>(null);
    const [loadingCourses, setLoadingCourses] = React.useState(true);

    const [allParents, setAllParents] = React.useState<any[]>([]);
    const [linkedParentId, setLinkedParentId] = React.useState<string | null>(null);
    const [isLinkingParent, setIsLinkingParent] = React.useState(false);
    const [parentSearch, setParentSearch] = React.useState("");
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const [quickSubjectTitle, setQuickSubjectTitle] = React.useState("");
    const [isQuickAdding, setIsQuickAdding] = React.useState(false);

    // Transfer-out state
    const [showTransferZone, setShowTransferZone] = React.useState(false);
    const [confirmName, setConfirmName] = React.useState('');
    const [isTransferring, setIsTransferring] = React.useState(false);

    const displayName = student.full_name || 'Unnamed Student';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

    // ── Fetch courses & enrollments when dialog opens ──────────────────────
    const fetchData = React.useCallback(async () => {
        setLoadingCourses(true);
        try {
            const [{ data: courses }, { data: enrollments }, { data: parents }, { data: links }] = await Promise.all([
                supabase.from('subjects').select('id, name, level').order('name'),
                supabase.from('enrollments').select('id, subject_id, status').eq('student_id', student.id),
                supabase.from('profiles').select('id, full_name').eq('role', 'Parent').order('full_name'),
                supabase.from('parent_student_links').select('parent_id').eq('student_id', student.id).maybeSingle(),
            ]);
            setAllCourses(courses || []);
            setEnrollmentsList(enrollments || []);
            setAllParents(parents || []);
            
            if (links?.parent_id) {
                setLinkedParentId(links.parent_id);
                const p = parents?.find((x: any) => x.id === links.parent_id);
                if (p) setParentSearch(p.full_name || '');
            } else {
                setLinkedParentId(null);
                setParentSearch('');
            }
        } catch (err) {
            console.error('Error fetching manage data:', err);
        } finally {
            setLoadingCourses(false);
        }
    }, [supabase, student.id]);

    React.useEffect(() => {
        if (open) {
            fetchData();
            setShowTransferZone(false);
            setConfirmName('');
        }
    }, [open, fetchData]);

    // ── Toggle enrollment ──────────────────────────────────────────────────
    const toggleEnrollment = async (courseId: string, enrollment: any) => {
        setTogglingId(courseId);

        if (enrollment) {
            const { error } = await supabase
                .from('enrollments')
                .delete()
                .eq('id', enrollment.id);

            if (error) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            } else {
                setEnrollmentsList(prev => prev.filter(e => e.id !== enrollment.id));
                toast({ title: 'Removed/Rejected', description: 'Subject enrollment removed.' });
            }
        } else {
            const { data, error } = await supabase
                .from('enrollments')
                .insert({ student_id: student.id, subject_id: courseId, status: 'approved' })
                .select()
                .single();

            if (error) {
                toast({ title: 'Error adding subject', description: error.message, variant: 'destructive' });
            } else {
                setEnrollmentsList(prev => [...prev, data]);
                toast({ title: 'Subject added', description: 'Student has been enrolled.' });
            }
        }
        setTogglingId(null);
    };

    const approveEnrollment = async (enrollmentId: string, courseId: string) => {
        setTogglingId(courseId);
        const { error } = await supabase
            .from('enrollments')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', enrollmentId);

        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            setEnrollmentsList(prev => prev.map(e => e.id === enrollmentId ? { ...e, status: 'approved' } : e));
            toast({ title: 'Approved', description: 'Enrollment has been approved.' });
        }
        setTogglingId(null);
    };

    // ── Link Parent ────────────────────────────────────────────────────────
    const handleLinkParent = async (parentId: string) => {
        setIsLinkingParent(true);
        // If there's an existing link, we could update it, or delete and insert.
        // Assuming 1 student has 1 parent here for simplicity (can expand if needed).
        await supabase.from('parent_student_links').delete().eq('student_id', student.id);
        
        if (parentId && parentId !== 'unassigned') {
            const { error } = await supabase.from('parent_student_links').insert({ parent_id: parentId, student_id: student.id });
            if (error) {
                toast({ title: 'Error linking parent', description: error.message, variant: 'destructive' });
            } else {
                setLinkedParentId(parentId);
                toast({ title: 'Parent Linked', description: 'The parent has been successfully assigned to this student.' });
            }
        } else {
             setLinkedParentId(null);
             toast({ title: 'Parent Unassigned', description: 'The parent has been removed from this student.' });
        }
        setIsLinkingParent(false);
    };

    const handleApplyParentLink = () => {
        if (!parentSearch.trim()) {
            handleLinkParent('unassigned');
            return;
        }
        const parent = allParents.find(p => p.full_name?.toLowerCase() === parentSearch.trim().toLowerCase());
        if (parent) {
            handleLinkParent(parent.id);
            setParentSearch(''); // clear search on success to avoid confusion
        } else {
            toast({ title: "Parent not found", description: "Please type the exact name of an existing parent.", variant: "destructive" });
        }
    };

    const handleQuickAddSubject = async () => {
        if (!quickSubjectTitle.trim()) return;
        setIsQuickAdding(true);
        try {
            const { data: course, error: courseError } = await supabase
                .from('courses')
                .insert({ title: quickSubjectTitle.trim(), status: 'Published' })
                .select()
                .single();
            if (courseError) throw courseError;
            
            const { error: enrollError } = await supabase
                .from('enrollments')
                .insert({ student_id: student.id, course_id: course.id });
            if (enrollError) throw enrollError;
            
            toast({ title: 'Subject added', description: `Student is now enrolled in ${course.title}.` });
            setQuickSubjectTitle('');
            fetchData();
        } catch (err: any) {
            toast({ title: 'Error adding subject', description: err.message, variant: 'destructive' });
        } finally {
            setIsQuickAdding(false);
        }
    };

    // ── Transfer Out (soft delete — suspend + mark transferred) ───────────
    const handleTransferOut = async () => {
        if (confirmName.trim().toLowerCase() !== displayName.trim().toLowerCase()) {
            toast({
                title: 'Name does not match',
                description: `Please type "${displayName}" exactly to confirm.`,
                variant: 'destructive',
            });
            return;
        }

        setIsTransferring(true);
        try {
            // Soft delete: mark the profile as not approved and set role to "transferred"
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: false, role: 'transferred' })
                .eq('id', student.id);

            if (error) throw error;

            toast({
                title: 'Student transferred out',
                description: `${displayName} has been transferred out and their access has been revoked.`,
            });
            setOpen(false);
            onStudentRemoved?.(student.id);
        } catch (err: any) {
            toast({ title: 'Transfer failed', description: err.message, variant: 'destructive' });
        } finally {
            setIsTransferring(false);
        }
    };

    // ─────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-primary border-primary/20 hover:bg-primary/10">
                    <Settings className="h-3 w-3 mr-1" />
                    Manage
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Manage Student</DialogTitle>
                    <DialogDescription>
                        Add or remove subject enrollments for this student, or transfer them out.
                    </DialogDescription>
                </DialogHeader>

                {/* ── Student Info ── */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar_url} alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate capitalize">Student</p>
                    </div>
                    <Badge
                        className={student.is_approved
                            ? 'bg-gold/10 text-gold hover:bg-gold/20'
                            : 'bg-gold/10 text-gold hover:bg-gold/20'}
                    >
                        {student.is_approved ? 'Active' : 'Pending'}
                    </Badge>
                </div>

                {/* ── Course Enrollment Management ── */}
                <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-sm">Subject Enrollments</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {enrollmentsList.filter(e => e.status === 'pending').length > 0 && (
                                <Badge variant="outline" className="bg-gold/10 text-gold border-gold">
                                    {enrollmentsList.filter(e => e.status === 'pending').length} pending
                                </Badge>
                            )}
                            <span>{enrollmentsList.filter(e => e.status === 'approved').length} enrolled</span>
                        </div>
                    </div>

                    {loadingCourses ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-8 w-24 rounded-md" />
                                </div>
                            ))}
                        </div>
                    ) : allCourses.length === 0 ? (
                        <div className="p-6 flex flex-col items-center justify-center text-center gap-3 border rounded-lg border-dashed bg-muted/20">
                            <p className="text-muted-foreground text-sm">No subjects available.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto max-h-[300px] -mx-1 px-1 pr-2 space-y-2">
                            {[...allCourses].sort((a, b) => {
                                const aPending = enrollmentsList.find(e => e.subject_id === a.id)?.status === 'pending';
                                const bPending = enrollmentsList.find(e => e.subject_id === b.id)?.status === 'pending';
                                if (aPending && !bPending) return -1;
                                if (!aPending && bPending) return 1;
                                return 0; // fallback to original alphabetical order
                            }).map(course => {
                                const enrollment = enrollmentsList.find(e => e.subject_id === course.id);
                                const isEnrolled = enrollment?.status === 'approved';
                                const isPending = enrollment?.status === 'pending';
                                const isToggling = togglingId === course.id;
                                return (
                                    <div
                                        key={course.id}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                                            isEnrolled ? 'bg-primary/5 border-primary/20' : isPending ? 'bg-gold/5 border-gold/20' : 'bg-background'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {isEnrolled
                                                ? <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                                : isPending
                                                ? <Loader2 className="h-4 w-4 text-gold flex-shrink-0 animate-pulse" />
                                                : <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            }
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm truncate font-medium">{course.name}</span>
                                                <span className="text-xs truncate text-muted-foreground">{course.level}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {isPending && (
                                                <Button
                                                    size="sm"
                                                    className="flex-shrink-0 h-8 px-3 text-xs bg-gold hover:bg-gold text-foreground"
                                                    onClick={() => approveEnrollment(enrollment.id, course.id)}
                                                    disabled={isToggling}
                                                >
                                                    {isToggling ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant={isEnrolled || isPending ? 'destructive' : 'outline'}
                                                className={`flex-shrink-0 h-8 px-3 text-xs ${
                                                    isEnrolled || isPending
                                                        ? 'bg-burgundy/10 text-burgundy border-burgundy hover:bg-burgundy/20 hover:text-burgundy'
                                                        : 'text-gold border-gold hover:bg-gold/10'
                                                }`}
                                                onClick={() => toggleEnrollment(course.id, enrollment)}
                                                disabled={isToggling}
                                            >
                                                {isToggling ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : isEnrolled ? (
                                                    <><BookMinus className="h-3 w-3 mr-1" />Remove</>
                                                ) : isPending ? (
                                                    <><UserX className="h-3 w-3 mr-1" />Reject</>
                                                ) : (
                                                    <><BookPlus className="h-3 w-3 mr-1" />Enroll</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Parent Linking ── */}
                <Separator />
                <div className="flex-1 min-h-0 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">Linked Parent</h3>
                    </div>
                    {loadingCourses ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input 
                                        placeholder="Type parent name..."
                                        value={parentSearch}
                                        onChange={(e) => {
                                            setParentSearch(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        disabled={isLinkingParent}
                                        className="w-full bg-background"
                                    />
                                    {showSuggestions && parentSearch.trim() && (
                                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                            {allParents
                                                .filter(p => p.full_name?.toLowerCase().includes(parentSearch.toLowerCase()))
                                                .map(p => (
                                                <div 
                                                    key={p.id} 
                                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                                                    onClick={() => {
                                                        setParentSearch(p.full_name || '');
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    {p.full_name}
                                                </div>
                                            ))}
                                            {allParents.filter(p => p.full_name?.toLowerCase().includes(parentSearch.toLowerCase())).length === 0 && (
                                                <div className="px-3 py-2 text-sm text-muted-foreground italic">No matches found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Button 
                                    variant="secondary" 
                                    onClick={handleApplyParentLink}
                                    disabled={isLinkingParent}
                                >
                                    {isLinkingParent ? <Loader2 className="h-4 w-4 animate-spin" /> : "Link"}
                                </Button>
                            </div>
                            {linkedParentId && (
                                <p className="text-xs text-muted-foreground flex justify-between items-center">
                                    <span>Currently linked: {allParents.find(p => p.id === linkedParentId)?.full_name || 'Unknown'}</span>
                                    <Button variant="ghost" size="sm" className="h-auto p-0 text-destructive hover:text-destructive hover:bg-transparent" onClick={() => { setParentSearch(''); handleLinkParent('unassigned'); }}>Unlink</Button>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Danger Zone: Transfer Out ── */}
                <Separator />
                <div className="space-y-3">
                    {!showTransferZone ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-burgundy border-burgundy hover:bg-red-50 hover:text-burgundy"
                            onClick={() => setShowTransferZone(true)}
                        >
                            <UserX className="h-4 w-4 mr-2" />
                            Transfer Out Student
                        </Button>
                    ) : (
                        <div className="rounded-lg border border-burgundy bg-red-50/50 p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-burgundy flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-burgundy">Transfer Out Confirmation</p>
                                    <p className="text-burgundy/80 text-xs mt-1">
                                        This will revoke all access for{' '}
                                        <span className="font-bold">{displayName}</span> and mark them as transferred.
                                        Type their full name below to confirm.
                                    </p>
                                </div>
                            </div>
                            <Input
                                placeholder={`Type "${displayName}" to confirm`}
                                value={confirmName}
                                onChange={(e) => setConfirmName(e.target.value)}
                                className="border-burgundy focus-visible:ring-red-400 bg-white"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => { setShowTransferZone(false); setConfirmName(''); }}
                                    disabled={isTransferring}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-burgundy hover:bg-burgundy text-foreground"
                                    onClick={handleTransferOut}
                                    disabled={
                                        isTransferring ||
                                        confirmName.trim().toLowerCase() !== displayName.trim().toLowerCase()
                                    }
                                >
                                    {isTransferring
                                        ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Processing…</>
                                        : <><UserX className="h-3 w-3 mr-1" />Confirm Transfer</>
                                    }
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

