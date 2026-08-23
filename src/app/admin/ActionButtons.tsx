'use client'

import { useState } from 'react'
import { updateEnrollmentStatus, getTutorsForSubject } from '@/app/actions/lms'
import { Check, X, Loader2, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function ActionButtons({ enrollmentId, subjectId }: { enrollmentId: string, subjectId: string }) {
  const [isPending, setIsPending] = useState(false)
  const [tutors, setTutors] = useState<any[]>([])
  const [loadingTutors, setLoadingTutors] = useState(false)

  const handleFetchTutors = async () => {
    if (tutors.length > 0) return;
    setLoadingTutors(true)
    const { data } = await getTutorsForSubject(subjectId)
    if (data) setTutors(data)
    setLoadingTutors(false)
  }

  const handleAction = async (status: 'approved' | 'rejected', tutorId?: string) => {
    setIsPending(true)
    const result = await updateEnrollmentStatus(enrollmentId, status, tutorId)
    setIsPending(false)
    if (result.error) {
      alert(result.error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      
      <DropdownMenu onOpenChange={(open) => { if (open) handleFetchTutors() }}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={isPending}
            className="h-8 px-3 bg-gold/10 text-gold border-gold/20 hover:bg-gold hover:text-foreground transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Approve & Assign
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Tutor for Student</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {loadingTutors ? (
            <div className="p-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : tutors.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground text-center">No tutors assigned to this subject yet.</div>
          ) : (
            tutors.map((t) => (
              <DropdownMenuItem 
                key={t.tutor_id}
                onClick={() => handleAction('approved', t.tutor_id)}
                className="cursor-pointer"
              >
                Assign to {t.profiles?.email || 'Unknown Tutor'}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handleAction('rejected')}
        disabled={isPending}
        className="h-8 w-8 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        title="Reject"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
