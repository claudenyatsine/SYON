'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CurriculumOnboardingModal() {
  const { user, profile, loading, refreshProfile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [board, setBoard] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && profile && profile.role === 'student' && !profile.curriculum_board) {
      setIsOpen(true);
    }
  }, [loading, profile]);

  const handleSubmit = async () => {
    if (!board || !level || !user) return;
    setSubmitting(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ curriculum_board: board, student_level: level })
      .eq('id', user.id);
      
    if (error) {
      console.error('Failed to save curriculum preference:', error.message || error);
    } else {
      await refreshProfile();
      setIsOpen(false);
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Dr Max LMS!</DialogTitle>
          <DialogDescription>
            Please tell us about your curriculum so we can personalize your learning experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-medium text-sm leading-none">Which board are you studying?</h4>
            <RadioGroup value={board} onValueChange={setBoard} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={() => setBoard('Cambridge')}>
                <RadioGroupItem value="Cambridge" id="cambridge" />
                <Label htmlFor="cambridge" className="flex-1 cursor-pointer">Cambridge</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={() => setBoard('ZimSec')}>
                <RadioGroupItem value="ZimSec" id="zimsec" />
                <Label htmlFor="zimsec" className="flex-1 cursor-pointer">ZimSec</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm leading-none">What is your current level?</h4>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Form 1">Form 1</SelectItem>
                <SelectItem value="Form 2">Form 2</SelectItem>
                <SelectItem value="Form 3">Form 3</SelectItem>
                <SelectItem value="Form 4">Form 4</SelectItem>
                <SelectItem value="O-Level">O-Level</SelectItem>
                <SelectItem value="AS-Level">AS-Level</SelectItem>
                <SelectItem value="A-Level">A-Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={!board || !level || submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
