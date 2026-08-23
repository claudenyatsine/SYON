'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, CheckCircle, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

export function AssignmentUploader({ assignmentId }: { assignmentId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let finalFile: File | Blob;
      let finalFileName: string;

      // If multiple files or single image, convert to PDF
      if (files.some(f => f.type.startsWith('image/'))) {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            if (i > 0) pdf.addPage();
            const dataUrl = await readFileAsDataURL(file);
            
            // Need to load image to get dimensions
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => { img.onload = resolve; });
            
            const imgRatio = img.width / img.height;
            const pdfRatio = pdfWidth / pdfHeight;
            
            let drawWidth = pdfWidth;
            let drawHeight = pdfWidth / imgRatio;
            
            if (drawHeight > pdfHeight) {
              drawHeight = pdfHeight;
              drawWidth = pdfHeight * imgRatio;
            }
            
            // Center the image
            const x = (pdfWidth - drawWidth) / 2;
            const y = (pdfHeight - drawHeight) / 2;
            
            pdf.addImage(dataUrl, 'JPEG', x, y, drawWidth, drawHeight);
          } else if (file.type === 'application/pdf') {
            // Cannot easily merge existing PDFs into jspdf on client without more complex libraries.
            // If it's a mix, we just throw an error.
            throw new Error("Cannot mix PDFs and Images. Please upload all images to combine into one PDF, or a single PDF.");
          }
        }
        finalFile = pdf.output('blob');
        finalFileName = `${assignmentId}/${user.id}_${Date.now()}.pdf`;
      } else {
        // Single PDF
        if (files.length > 1) {
          throw new Error("Please combine your PDFs into one file before uploading, or upload individual images to have us combine them automatically.");
        }
        finalFile = files[0];
        const fileExt = files[0].name.split('.').pop();
        finalFileName = `${assignmentId}/${user.id}_${Date.now()}.${fileExt}`;
      }

      // 1. Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student_submissions')
        .upload(finalFileName, finalFile, { contentType: finalFile.type || 'application/pdf' });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student_submissions')
        .getPublicUrl(finalFileName);

      // 3. Insert into submissions table
      const { error: dbError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: user.id,
          file_url: publicUrl,
          status: 'submitted'
        });

      if (dbError) throw dbError;

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Your assignment has been submitted for grading.',
      });

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred while uploading.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-8 text-center space-y-3">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
        <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">Assignment Submitted</h3>
        <p className="text-sm text-green-600 dark:text-green-500 max-w-md mx-auto">
          Your work has been sent to your tutor for grading. You will be notified when it's reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center space-y-4">
      <h3 className="font-semibold text-lg">Submit Assignment</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Ready to submit? Upload your file below to send it to your tutor for grading. You can add multiple images page by page to organize your submission.
      </p>

      <div className="max-w-md mx-auto mt-6 space-y-3">
        {files.length > 0 && (
          <div className="space-y-2 text-left mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pages ({files.length})</h4>
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-background border p-2 rounded-lg">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-muted p-2 rounded text-muted-foreground">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium truncate">Page {idx + 1}: {file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center gap-2 w-full py-4 px-4 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors bg-background"
        >
          <div className="flex flex-col items-center gap-1 text-sm font-medium text-muted-foreground">
            <div className="bg-primary/10 p-2 rounded-full mb-1">
              {files.length > 0 ? <Plus className="w-5 h-5 text-primary" /> : <Upload className="w-5 h-5 text-primary" />}
            </div>
            <span className="text-foreground">{files.length > 0 ? 'Add another page' : 'Choose files to upload'}</span>
            <span className="text-xs font-normal">Supports Images & PDFs</span>
          </div>
        </label>
      </div>

      <Button 
        className="mt-6 w-full max-w-xs" 
        size="lg" 
        disabled={files.length === 0 || isUploading}
        onClick={handleUpload}
      >
        {isUploading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Compiling & Uploading...</>
        ) : (
          `Send for Grading (${files.length} ${files.length === 1 ? 'Page' : 'Pages'})`
        )}
      </Button>
    </div>
  );
}
