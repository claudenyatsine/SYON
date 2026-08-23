'use client';

import { useState, useEffect } from "react";
import { PlusCircle, Loader2, Upload, Trash2, Calendar, Clock, BookOpen, Video, FileQuestion, FileText, Layers, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type ModuleItem = {
    title: string;
    item_type: 'topic' | 'live_class' | 'test';
    start_date: string;
    duration_minutes: number;
    exam_allocation_2026: string;
    key_questions: string[];
    assignments: { assignment_number: number; title: string; description: string }[];
};

type ModuleBlock = {
    title: string;
    description: string;
    sequence_order: number;
    course_level: string;
    items: ModuleItem[];
};

export function CreateCourseDialog({ tutorId, onCourseCreated, trigger }: { 
    tutorId: string; 
    onCourseCreated?: () => void;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    // Context Selection
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    
    // State
    const [imageUrl, setImageUrl] = useState("");
    const [modules, setModules] = useState<ModuleBlock[]>([]);
    const [uploading, setUploading] = useState(false);
    
    const supabase = createClient();

    // Fetch assigned subjects
    useEffect(() => {
        if (open && tutorId) {
            const fetchSubjects = async () => {
                const { data } = await supabase
                    .from('tutor_subjects')
                    .select('subject_id, subjects(id, name, level)')
                    .eq('tutor_id', tutorId);
                
                if (data) {
                    setSubjects(data.map(d => d.subjects));
                }
            };
            fetchSubjects();
        }
    }, [open, tutorId, supabase]);

    const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tutorId) return;

        setUploading(true);
        const localUrl = URL.createObjectURL(file);
        setImageUrl(localUrl);

        try {
            const fileName = `${tutorId}/${Date.now()}.jpg`;
            const { error } = await supabase.storage
                .from('course-banners')
                .upload(fileName, file, { upsert: false });
            
            if (error) throw error;

            const { data } = supabase.storage.from('course-banners').getPublicUrl(fileName);
            if (data?.publicUrl) {
                setImageUrl(data.publicUrl);
                URL.revokeObjectURL(localUrl);
            }
        } catch (err: any) {
            console.error("Upload failed:", err);
            setImageUrl(""); // Revert on failure
        } finally {
            setUploading(false);
        }
    };

    const addModule = () => {
        setModules([...modules, { 
            title: "", 
            description: "", 
            sequence_order: modules.length + 1,
            course_level: "O-Level", // default
            items: [] 
        }]);
    };

    const updateModule = (mIndex: number, field: keyof ModuleBlock, value: any) => {
        const newMods = [...modules];
        newMods[mIndex] = { ...newMods[mIndex], [field]: value };
        setModules(newMods);
    };

    const removeModule = (mIndex: number) => {
        setModules(modules.filter((_, i) => i !== mIndex).map((m, i) => ({ ...m, sequence_order: i + 1 })));
    };

    const addItem = (mIndex: number, type: 'topic' | 'live_class' | 'test') => {
        const newMods = [...modules];
        const defaultAssignments = type === 'topic' ? [
            { assignment_number: 1, title: 'Assignment 1', description: 'Interactive assignment' },
            { assignment_number: 2, title: 'Assignment 2', description: 'Interactive assignment' },
            { assignment_number: 3, title: 'Assignment 3', description: 'Interactive assignment' },
            { assignment_number: 4, title: 'Assignment 4', description: 'Interactive assignment' }
        ] : [];

        newMods[mIndex].items.push({
            title: "",
            item_type: type,
            start_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
            duration_minutes: type === 'live_class' ? 60 : 30,
            exam_allocation_2026: "Paper 1",
            key_questions: [""],
            assignments: defaultAssignments
        });
        setModules(newMods);
    };

    const updateItem = (mIndex: number, iIndex: number, field: keyof ModuleItem, value: any) => {
        const newMods = [...modules];
        newMods[mIndex].items[iIndex] = { ...newMods[mIndex].items[iIndex], [field]: value };
        setModules(newMods);
    };

    const removeItem = (mIndex: number, iIndex: number) => {
        const newMods = [...modules];
        newMods[mIndex].items = newMods[mIndex].items.filter((_, i) => i !== iIndex);
        setModules(newMods);
    };

    const updateKeyQuestion = (mIndex: number, iIndex: number, qIndex: number, value: string) => {
        const newMods = [...modules];
        newMods[mIndex].items[iIndex].key_questions[qIndex] = value;
        setModules(newMods);
    };

    const addKeyQuestion = (mIndex: number, iIndex: number) => {
        const newMods = [...modules];
        newMods[mIndex].items[iIndex].key_questions.push("");
        setModules(newMods);
    };

    const removeKeyQuestion = (mIndex: number, iIndex: number, qIndex: number) => {
        const newMods = [...modules];
        newMods[mIndex].items[iIndex].key_questions = newMods[mIndex].items[iIndex].key_questions.filter((_, idx) => idx !== qIndex);
        setModules(newMods);
    };

    const handleCreate = async () => {
        if (!selectedSubjectId || !tutorId) return;
        setLoading(true);
        
        try {
            // Transform and package metadata for Postgres JSONB
            const payload = modules.map(m => ({
                title: m.title,
                description: m.description,
                sequence_order: m.sequence_order,
                course_level: m.course_level,
                items: m.items.map(i => ({
                    title: i.title,
                    item_type: i.item_type,
                    start_date: new Date(i.start_date).toISOString(),
                    duration_minutes: i.duration_minutes,
                    metadata: {
                        exam_allocation_2026: i.exam_allocation_2026,
                        key_questions: i.key_questions.filter(q => q.trim() !== '')
                    },
                    assignments: i.assignments
                }))
            }));

            // Single RPC Payload Transaction
            const { error } = await supabase.rpc('batch_create_curriculum', {
                p_subject_id: selectedSubjectId,
                p_tutor_id: tutorId,
                p_modules: payload
            });

            if (error) throw error;

            toast({
                title: "Submitted for Review",
                description: "Your curriculum has been sent to the admin for approval.",
            });

            setOpen(false);
            setModules([]);
            setSelectedSubjectId("");
            setImageUrl("");
            if (onCourseCreated) onCourseCreated();
        } catch (err: any) {
            console.error("Failed to create curriculum:", err);
            toast({
                title: "Failed to submit curriculum",
                description: err.message || "An unexpected error occurred",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Course
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-3xl overflow-hidden flex flex-col p-0">
                <SheetHeader className="px-6 py-4 border-b shrink-0">
                    <SheetTitle>Create New Course Curriculum</SheetTitle>
                    <SheetDescription>
                        Define your course by selecting an assigned subject and building out its modules.
                    </SheetDescription>
                </SheetHeader>
                
                <ScrollArea className="flex-1 px-6 py-6">
                    <div className="grid gap-8 pb-12">
                        
                        {/* Context Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold text-sm">Course Subject</h4>
                            </div>
                            <div className="grid gap-2">
                                <Label>Assigned Subject</Label>
                                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                                    <SelectTrigger className="w-full bg-background">
                                        <SelectValue placeholder="Select a subject..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.length === 0 && <SelectItem value="none" disabled>No active assignments found.</SelectItem>}
                                        {subjects.map((sub: any) => (
                                            <SelectItem key={sub.id} value={sub.id}>
                                                {sub.name} ({sub.level})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Image Upload */}
                            <div className="grid gap-2">
                                <Label htmlFor="image">Course Banner</Label>
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <Input
                                            id="image"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="Paste image URL or wait for upload..."
                                            className="flex-grow bg-background"
                                        />
                                        <div className="relative shrink-0">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="banner-upload"
                                                onChange={uploadBanner}
                                            />
                                            <Label
                                                htmlFor="banner-upload"
                                                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 cursor-pointer ${uploading ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                                            >
                                                {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </Label>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Recommended: 1200x600px (2:1 aspect ratio)</p>
                                </div>
                            </div>
                        </div>

                        {/* Module Builder */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <h4 className="font-semibold text-sm">Curriculum Modules</h4>
                                </div>
                                <Button onClick={addModule} size="sm" variant="outline">
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Module Block
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {modules.map((mod, mIdx) => (
                                    <Card key={mIdx} className="bg-muted/10 border-muted">
                                        <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-start justify-between space-y-0 rounded-t-xl">
                                            <div className="flex-1 space-y-3 mr-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="default" className="text-[10px] uppercase">Module {mod.sequence_order}</Badge>
                                                    <Select value={mod.course_level} onValueChange={(v) => updateModule(mIdx, 'course_level', v)}>
                                                        <SelectTrigger className="h-6 text-xs w-[120px] bg-background">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="O-Level">O-Level</SelectItem>
                                                            <SelectItem value="AS-Level">AS-Level</SelectItem>
                                                            <SelectItem value="A-Level">A-Level</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Input 
                                                    value={mod.title} 
                                                    onChange={(e) => updateModule(mIdx, 'title', e.target.value)} 
                                                    placeholder="Module Title (e.g. Kinematics)" 
                                                    className="bg-background font-medium"
                                                />
                                                <Textarea 
                                                    value={mod.description} 
                                                    onChange={(e) => updateModule(mIdx, 'description', e.target.value)} 
                                                    placeholder="Brief description of this module..." 
                                                    className="bg-background min-h-[60px] text-sm"
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeModule(mIdx)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardHeader>
                                        
                                        <CardContent className="pt-4 space-y-4">
                                            {mod.items.map((item, iIdx) => (
                                                <div key={iIdx} className="p-4 border rounded-lg bg-background shadow-sm space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {item.item_type === 'live_class' ? (
                                                                <Badge variant="secondary" className="bg-gold/10 text-gold"><Video className="w-3 h-3 mr-1"/> Live Class</Badge>
                                                            ) : item.item_type === 'test' ? (
                                                                <Badge variant="secondary" className="bg-gold/10 text-gold"><FileQuestion className="w-3 h-3 mr-1"/> Test</Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="bg-gold/10 text-gold"><BookOpen className="w-3 h-3 mr-1"/> Topic</Badge>
                                                            )}
                                                            
                                                            <Select value={item.exam_allocation_2026} onValueChange={(v) => updateItem(mIdx, iIdx, 'exam_allocation_2026', v)}>
                                                                <SelectTrigger className="h-6 text-xs w-[120px] bg-background">
                                                                    <SelectValue placeholder="Paper Type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Paper 1">Paper 1</SelectItem>
                                                                    <SelectItem value="Paper 2">Paper 2</SelectItem>
                                                                    <SelectItem value="Paper 3">Paper 3</SelectItem>
                                                                    <SelectItem value="Paper 4">Paper 4</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeItem(mIdx, iIdx)}>
                                                            &times;
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="grid gap-3 sm:grid-cols-12">
                                                        <div className="sm:col-span-12">
                                                            <Input 
                                                                value={item.title} 
                                                                onChange={(e) => updateItem(mIdx, iIdx, 'title', e.target.value)} 
                                                                placeholder={item.item_type === 'live_class' ? "Class Topic" : item.item_type === 'test' ? "Test Name" : "Topic Title"} 
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-7">
                                                            <div className="relative">
                                                                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input 
                                                                    type="datetime-local" 
                                                                    className="pl-9"
                                                                    value={item.start_date}
                                                                    onChange={(e) => updateItem(mIdx, iIdx, 'start_date', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="sm:col-span-5">
                                                            <div className="relative">
                                                                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input 
                                                                    type="number" 
                                                                    className="pl-9"
                                                                    value={item.duration_minutes}
                                                                    onChange={(e) => updateItem(mIdx, iIdx, 'duration_minutes', parseInt(e.target.value))}
                                                                    placeholder="Mins"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Key Questions Array */}
                                                    <div className="space-y-2 border-t pt-3">
                                                        <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1"><Tag className="w-3 h-3" /> Key Questions</Label>
                                                        {item.key_questions.map((q, qIdx) => (
                                                            <div key={qIdx} className="flex items-center gap-2">
                                                                <span className="text-primary text-sm">•</span>
                                                                <Input 
                                                                    value={q} 
                                                                    onChange={(e) => updateKeyQuestion(mIdx, iIdx, qIdx, e.target.value)}
                                                                    placeholder="e.g. What were the causes of WWII?"
                                                                    className="h-8 text-sm flex-1"
                                                                />
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeKeyQuestion(mIdx, iIdx, qIdx)}>
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button variant="ghost" size="sm" className="h-8 text-xs text-primary" onClick={() => addKeyQuestion(mIdx, iIdx)}>
                                                            + Add Question
                                                        </Button>
                                                    </div>

                                                    {/* Assignments Section */}
                                                    {item.item_type === 'topic' && item.assignments && item.assignments.length > 0 && (
                                                        <div className="space-y-2 border-t pt-3">
                                                            <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1"><FileText className="w-3 h-3" /> Interactive Assignments</Label>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {item.assignments.map((assignment, aIdx) => (
                                                                    <div key={aIdx} className="bg-muted/30 p-2 rounded border text-sm">
                                                                        <div className="font-medium text-xs mb-1">Assignment {assignment.assignment_number}</div>
                                                                        <Input 
                                                                            value={assignment.title} 
                                                                            onChange={(e) => {
                                                                                const newMods = [...modules];
                                                                                newMods[mIdx].items[iIdx].assignments[aIdx].title = e.target.value;
                                                                                setModules(newMods);
                                                                            }}
                                                                            placeholder="Title"
                                                                            className="h-7 text-xs bg-background mb-1"
                                                                        />
                                                                        <Input 
                                                                            value={assignment.description} 
                                                                            onChange={(e) => {
                                                                                const newMods = [...modules];
                                                                                newMods[mIdx].items[iIdx].assignments[aIdx].description = e.target.value;
                                                                                setModules(newMods);
                                                                            }}
                                                                            placeholder="Description (Optional)"
                                                                            className="h-7 text-xs bg-background"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            <div className="flex flex-wrap gap-2 pt-2">
                                                <Button size="sm" variant="secondary" onClick={() => addItem(mIdx, 'topic')} className="flex-1 bg-gold/5 text-gold hover:bg-gold/10 border border-gold/20">
                                                    <BookOpen className="w-3 h-3 mr-2" /> Add Topic
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => addItem(mIdx, 'live_class')} className="flex-1 bg-gold/5 text-gold hover:bg-gold/10 border border-gold/20">
                                                    <Video className="w-3 h-3 mr-2" /> Add Live Class
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => addItem(mIdx, 'test')} className="flex-1 bg-gold/5 text-gold hover:bg-gold/10 border border-gold/20">
                                                    <FileQuestion className="w-3 h-3 mr-2" /> Add Test
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                
                                {modules.length === 0 && (
                                    <div className="p-12 text-center border rounded-xl border-dashed bg-muted/20">
                                        <p className="text-sm text-muted-foreground mb-4">Start building your curriculum structure.</p>
                                        <Button onClick={addModule} variant="outline">
                                            <PlusCircle className="w-4 h-4 mr-2" />
                                            Add First Module
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </ScrollArea>
                
                <SheetFooter className="px-6 py-4 border-t bg-background shrink-0">
                    <Button onClick={handleCreate} disabled={loading || !selectedSubjectId || modules.length === 0} className="w-full sm:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit for Admin Review
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
