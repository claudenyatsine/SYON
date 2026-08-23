'use client';

import { useState, useEffect } from "react";
import { PlusCircle, Loader2, Upload, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";

export function CreatePostDialog({ 
    communityId, 
    authorId,
    trigger 
}: { 
    communityId: string; 
    authorId: string;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const supabase = createClient();

    useEffect(() => {
        // Cleanup local preview URLs to prevent memory leaks
        return () => {
            if (imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !authorId) return;

        // Immediate local preview
        const localPreview = URL.createObjectURL(file);
        setImageUrl(localPreview);

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${authorId}/${Math.random()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('community-assets')
            .upload(filePath, file);

        if (uploadError) {
            console.error(uploadError);
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('community-assets')
            .getPublicUrl(filePath);

        // Finalize with production URL
        setImageUrl(publicUrl);
        setUploading(false);
    };

    const handleCreate = async () => {
        if (!title || !content || !authorId || !communityId) return;
        setLoading(true);
        
        const { error } = await supabase
            .from('posts')
            .insert({
                title,
                content,
                image_url: imageUrl,
                community_id: communityId,
                user_id: authorId
            });

        if (!error) {
            setOpen(false);
            setTitle("");
            setContent("");
            setImageUrl("");
        } else {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Post
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                    <DialogDescription>
                        Share your thoughts, questions, or updates with the community.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="post-title">Post Title</Label>
                        <Input 
                            id="post-title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="What's on your mind?" 
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="post-content">Content</Label>
                        <Textarea 
                            id="post-content" 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                            placeholder="Tell us more..." 
                            className="min-h-[120px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Attachment (Optional)</Label>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Input 
                                    placeholder="Paste image URL..." 
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="flex-grow"
                                />
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        id="post-image-upload" 
                                        onChange={handleUpload}
                                        disabled={uploading}
                                    />
                                    <Label 
                                        htmlFor="post-image-upload" 
                                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                                        Upload
                                    </Label>
                                </div>
                            </div>
                            
                            {imageUrl && (
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted mt-2">
                                    <img src={imageUrl} alt="Post attachment preview" className="object-contain w-full h-full" />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                                        </div>
                                    )}
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                                        onClick={() => setImageUrl("")}
                                        disabled={uploading}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate} disabled={loading || !title || !content} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post to Community
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
