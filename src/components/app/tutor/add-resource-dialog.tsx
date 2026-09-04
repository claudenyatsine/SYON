'use client';

import { useState, useEffect } from "react";
import { PlusCircle, Loader2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddResourceDialog({ tutorId, trigger }: { 
    tutorId: string; 
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    
    const [category, setCategory] = useState<'notes' | 'past_paper' | 'powerpoint' | 'voice_note' | 'recording'>('notes');
    
    const supabase = createClient();

    useEffect(() => {
        if (open && tutorId) {
            const fetchSubjects = async () => {
                const { data } = await supabase
                    .from('tutor_subjects')
                    .select('subject_id, subjects(id, name, level)')
                    .eq('tutor_id', tutorId);
                
                if (data) {
                    setSubjects(data.map(d => d.subjects).filter(Boolean));
                }
            };
            fetchSubjects();
        }
    }, [open, tutorId, supabase]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            
            const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
            if (['ppt', 'pptx'].includes(ext)) {
                setCategory('powerpoint');
            } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
                setCategory('recording');
            } else if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext)) {
                setCategory('voice_note');
            } else if (category !== 'past_paper') {
                setCategory('notes');
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedSubjectId || !title || !file || !tutorId) return;
        setLoading(true);
        
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `tutor-${tutorId}/${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('class_resources')
                .upload(filePath, file);
                
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('class_resources')
                .getPublicUrl(filePath);

            const rawExt = (fileExt?.toLowerCase() || 'pdf').replace(/^\./, '');
            
            // Map file extension to Postgres resource_format enum: ('pdf', 'video', 'word', 'excel', 'ppt', 'mp3')
            let validFormat: 'pdf' | 'video' | 'word' | 'excel' | 'ppt' | 'mp3' = 'pdf';
            if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(rawExt)) validFormat = 'word';
            else if (['xls', 'xlsx', 'csv'].includes(rawExt)) validFormat = 'excel';
            else if (['ppt', 'pptx'].includes(rawExt)) validFormat = 'ppt';
            else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(rawExt)) validFormat = 'video';
            else if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(rawExt)) validFormat = 'mp3';
            else validFormat = 'pdf';

            // Map to Postgres resource_type enum: ('notes', 'past_paper', 'powerpoint', 'voice_note', 'recording')
            let validResourceType: 'notes' | 'past_paper' | 'powerpoint' | 'voice_note' | 'recording' = category;
            if (category === 'past_paper') {
                validResourceType = 'past_paper';
            } else if (validFormat === 'ppt') {
                validResourceType = 'powerpoint';
            } else if (validFormat === 'video') {
                validResourceType = 'recording';
            } else if (validFormat === 'mp3') {
                validResourceType = 'voice_note';
            } else {
                validResourceType = 'notes';
            }

            const fileSizeFormatted = file.size 
                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                : undefined;

            const { error: insertError } = await supabase.from('resources').insert({
                title: title,
                format: validFormat,
                type: validResourceType,
                file_url: publicUrl,
                file_size: fileSizeFormatted,
                size_mb: file.size ? +(file.size / (1024 * 1024)).toFixed(2) : null,
                subject_id: selectedSubjectId,
                source: 'tutor_upload',
                uploaded_by: tutorId,
                tutor_id: tutorId,
                description: JSON.stringify({
                    approval_status: 'pending_admin_review',
                    submitted_at: new Date().toISOString()
                })
            });

            if (insertError) throw insertError;

            toast({
                title: "Resource Submitted",
                description: "The resource has been sent to the admin for validation. It will be shared with your students once approved.",
            });

            setOpen(false);
            setTitle("");
            setFile(null);
            setSelectedSubjectId("");
            setCategory('notes');
        } catch (err: any) {
            console.error("Failed to upload resource:", err);
            toast({
                title: "Upload Failed",
                description: err.message || "An unexpected error occurred",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resource
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Resource</DialogTitle>
                    <DialogDescription>
                        Share learning materials with students assigned to your subjects.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Assigned Subject</Label>
                        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                            <SelectTrigger>
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
                    
                    <div className="grid gap-2">
                        <Label htmlFor="title">Resource Title</Label>
                        <Input 
                            id="title" 
                            placeholder="e.g. Week 1 Math Formulas" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label>Resource Category</Label>
                        <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="notes">Study Notes / Revision Guide</SelectItem>
                                <SelectItem value="past_paper">Past Exam Paper / Assessment</SelectItem>
                                <SelectItem value="powerpoint">Presentation / Slides</SelectItem>
                                <SelectItem value="voice_note">Audio / Voice Note</SelectItem>
                                <SelectItem value="recording">Recorded Class / Video</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="file">Document</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="file" 
                                type="file" 
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button onClick={handleUpload} disabled={loading || !selectedSubjectId || !title || !file}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload Resource
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
