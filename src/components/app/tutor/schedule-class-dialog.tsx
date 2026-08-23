'use client';

import { useState, useEffect } from "react";
import { CalendarPlus, Loader2, Sparkles, Upload, Video, Clock, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function ScheduleClassDialog({ tutorId, onClassScheduled, trigger }: { 
    tutorId: string; 
    onClassScheduled?: () => void;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState("12:00");
    const [status, setStatus] = useState("upcoming");
    const [subjectId, setSubjectId] = useState("");
    const [subjects, setSubjects] = useState<any[]>([]);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        if (open && tutorId) {
            // Fetch subjects assigned to this tutor
            supabase
                .from('tutor_subjects')
                .select('subject_id, subjects(id, name, level)')
                .eq('tutor_id', tutorId)
                .then(({ data }) => {
                    if (data) {
                        const mapped = data.map((ts: any) => ts.subjects).filter(Boolean);
                        setSubjects(mapped);
                    }
                });
        }
    }, [open, tutorId, supabase]);

    const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                const canvas = document.createElement('canvas');
                const scale = Math.min(1, maxWidth / img.width);
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas not supported'));
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
            img.src = objectUrl;
        });
    };

    const uploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tutorId) return;

        if (file.size > 10 * 1024 * 1024) {
            setUploadError("File is too large. Max 10MB allowed.");
            return;
        }

        setUploadError(null);
        setUploading(true);
        setUploadProgress(0);

        const localUrl = URL.createObjectURL(file);
        setImageUrl(localUrl);
        setUploadProgress(10);

        let progressInterval: NodeJS.Timeout | undefined = undefined;

        try {
            const compressed = await compressImage(file);
            setUploadProgress(20);

            const fileName = `${tutorId}/${Date.now()}.jpg`;
            const filePath = `class-thumbnails/${fileName}`;

            let currentFakeProgress = 20;
            progressInterval = setInterval(() => {
                currentFakeProgress += Math.floor(Math.random() * 5) + 3;
                if (currentFakeProgress > 90) currentFakeProgress = 90;
                setUploadProgress(currentFakeProgress);
            }, 100);

            const { error: uploadErr } = await supabase.storage
                .from('course-banners')
                .upload(filePath, compressed, { upsert: false, contentType: 'image/jpeg' });
            
            clearInterval(progressInterval);

            if (uploadErr) throw uploadErr;
            setUploadProgress(95);

            const { data } = supabase.storage
                .from('course-banners')
                .getPublicUrl(filePath);

            if (!data?.publicUrl) throw new Error("Could not retrieve public URL.");

            setUploadProgress(100);
            setImageUrl(data.publicUrl);
            URL.revokeObjectURL(localUrl);
        } catch (err: any) {
            console.error("Upload failed:", err);
            setUploadError(err.message || "Upload failed. Please try again.");
        } finally {
            clearInterval(progressInterval);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSchedule = () => {
        if (!title || !date || !tutorId || !subjectId || uploading) return;
        setLoading(true);
        
        const fullDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        fullDate.setHours(hours, minutes);

        const insertTitle = title;
        const insertStatus = status;
        const insertSubjectId = subjectId;

        setOpen(false);
        setTitle("");
        setDate(undefined);
        setTime("12:00");
        setStatus("upcoming");
        setSubjectId("");
        setImageUrl("");
        setLoading(false);
        if (onClassScheduled) onClassScheduled();

        supabase
            .from('classes')
            .insert({
                title: insertTitle,
                schedule: fullDate.toISOString(),
                status: insertStatus,
                tutor_id: tutorId,
                subject_id: insertSubjectId,
                image_url: imageUrl
            })
            .then(({ error }) => {
                if (error) {
                    console.error('Insert error:', JSON.stringify(error), error);
                    toast({
                        title: 'Could not save class',
                        description: error.message,
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: '🎉 Class Scheduled!',
                        description: `"${insertTitle}" has been added to your schedule.`,
                    });
                    if (onClassScheduled) onClassScheduled();
                }
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-gold hover:bg-gold text-[#0A1A12] font-bold rounded-xl transition-all hover:scale-105">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Schedule New Class
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-background border-border text-foreground overflow-hidden p-0 gap-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-[#6A994E] to-[#A7C957] animate-gradient" />
                
                <DialogHeader className="p-8 pb-4 text-left">
                    <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Schedule New Live Class
                    </DialogTitle>
                    <DialogDescription className="text-foreground/">
                        Craft your next session. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-8 pb-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="title" className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/">Session Title</Label>
                        <Input 
                            id="title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="e.g. Masterclass: Advanced Physics" 
                            className="bg-muted border-border rounded-xl h-12 text-base focus:ring-[#A7C957]/20"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/">Subject</Label>
                        <Select value={subjectId} onValueChange={setSubjectId}>
                            <SelectTrigger className="bg-muted border-border rounded-xl h-12 text-sm focus:ring-[#A7C957]/20">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border text-foreground rounded-xl">
                                {subjects.length === 0 ? (
                                    <SelectItem value="none" disabled>No subjects assigned</SelectItem>
                                ) : (
                                    subjects.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="focus:bg-gold focus:text-[#0A1A12]">
                                            {s.name} ({s.level})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/">Class Banner / Thumbnail</Label>
                        <div className="relative group border-2 border-dashed border-border rounded-xl hover:border-gold/50 transition-colors bg-muted/50 overflow-hidden">
                            {imageUrl ? (
                                <div className="relative aspect-[3/1] w-full">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-sm font-bold flex items-center gap-2">
                                            <Upload className="w-4 h-4" /> Change Image
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                                        <Upload className="w-5 h-5 text-gold" />
                                    </div>
                                    <p className="text-sm font-bold text-foreground">Upload class banner</p>
                                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG up to 10MB</p>
                                </div>
                            )}
                            
                            {uploading && (
                                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-gold animate-spin mb-2" />
                                    <div className="w-3/4 bg-muted rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className="bg-gold h-full transition-all duration-300" 
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={uploadThumbnail} 
                                disabled={uploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                        </div>
                        {uploadError && <p className="text-xs text-burgundy font-medium">{uploadError}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="bg-muted border-border rounded-xl h-12 text-left justify-start text-foreground hover:bg-muted">
                                        <CalendarIcon className="mr-2 h-4 w-4 text-gold" />
                                        {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-background border-border text-foreground rounded-xl" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        className="bg-transparent text-foreground"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/">Start Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold pointer-events-none" />
                                <Input 
                                    type="time" 
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="bg-muted border-border rounded-xl h-12 pl-12 focus:ring-[#A7C957]/20 [appearance:none] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/">Stream Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="bg-muted border-border rounded-xl h-12 text-sm focus:ring-[#A7C957]/20">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border text-foreground rounded-xl">
                                <SelectItem value="upcoming" className="focus:bg-gold focus:text-[#0A1A12]">Upcoming Session</SelectItem>
                                <SelectItem value="ongoing" className="focus:bg-gold focus:text-[#0A1A12]">Live Now</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="p-8 pt-0">
                    <Button 
                        onClick={handleSchedule} 
                        disabled={loading || !title || !date || !subjectId || uploading} 
                        className="w-full h-14 bg-gradient-to-r from-gold to-gold hover:from-gold hover:to-gold text-[#0A1A12] font-bold rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gold/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" />}
                        {loading ? 'Finalizing Class...' : 'Create & Schedule Class'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
