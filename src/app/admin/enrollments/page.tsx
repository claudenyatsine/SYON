import { getPendingEnrollments } from '@/app/actions/lms'
import { ActionButtons } from '../ActionButtons'
import { UserCircle, BookOpen, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function AdminEnrollmentsPage() {
  const { data: enrollments, error } = await getPendingEnrollments()

  return (
    <div className="p-8 font-sans space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Pending Enrollments</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve student course enrollment requests.
        </p>
      </header>

      {error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : !enrollments || enrollments.length === 0 ? (
        <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/5">
          <div className="p-4 bg-muted rounded-full">
            <BookOpen className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold">All Caught Up!</h3>
          <p className="text-muted-foreground">There are no pending enrollment requests at this time.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Requested</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.map((enrollment: any) => (
                  <tr key={enrollment.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-foreground">
                          {enrollment.profiles?.full_name || `${enrollment.student_id.substring(0, 8)}...`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {enrollment.subjects?.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {enrollment.subjects?.level} - {enrollment.subjects?.category}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDistanceToNow(new Date(enrollment.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <ActionButtons enrollmentId={enrollment.id} subjectId={enrollment.subject_id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
