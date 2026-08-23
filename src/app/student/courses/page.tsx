import { getSubjects, getMyEnrollments } from '@/app/actions/lms'
import { EnrollButton } from './EnrollButton'
import Link from 'next/link'
import { BookOpen, GraduationCap, Clock, CheckCircle, ArrowLeft } from 'lucide-react'

export default async function CoursesPage() {
  const [{ data: subjects }, { data: enrollments }] = await Promise.all([
    getSubjects(),
    getMyEnrollments()
  ])

  // Group subjects by Level -> Category
  const grouped = subjects?.reduce((acc, subject) => {
    if (!acc[subject.level]) acc[subject.level] = {}
    if (!acc[subject.level][subject.category]) acc[subject.level][subject.category] = []
    acc[subject.level][subject.category].push(subject)
    return acc
  }, {} as Record<string, Record<string, any[]>>) || {}

  return (
    <div className="min-h-screen bg-background text-foreground p-8 pt-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="space-y-6">
          <Link href="/student" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Course Catalog
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Browse and enroll in your preferred O-Level and A-Level courses. Await admin approval to access materials.
            </p>
          </div>
        </header>

        <div className="space-y-16">
          {Object.entries(grouped).map(([level, categories]) => (
            <section key={level} className="space-y-8">
              <div className="flex items-center gap-3 border-b pb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">{level}</h2>
              </div>
              
              <div className="space-y-12">
                {Object.entries(categories as Record<string, any[]>).map(([category, subs]) => (
                  <div key={category} className="space-y-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-5 h-5" />
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subs.map(subject => {
                        const enrollment = enrollments?.find(e => e.subject_id === subject.id)
                        
                        return (
                          <div 
                            key={subject.id} 
                            className="group relative bg-card border rounded-2xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg flex flex-col h-full"
                          >
                            <div className="flex-1 space-y-4">
                              <h4 className="text-xl font-medium group-hover:text-primary transition-colors">
                                {subject.name}
                              </h4>
                              
                              {enrollment ? (
                                <div className="mt-4">
                                  {enrollment.status === 'pending' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gold/10 text-gold border border-gold/20">
                                      <Clock className="w-4 h-4" />
                                      Awaiting Approval
                                    </span>
                                  ) : enrollment.status === 'approved' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gold/10 text-gold border border-gold/20">
                                      <CheckCircle className="w-4 h-4" />
                                      Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                      Rejected
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Not enrolled</p>
                              )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-border/50">
                              {!enrollment ? (
                                <EnrollButton subjectId={subject.id} />
                              ) : enrollment.status === 'approved' ? (
                                <Link 
                                  href={`/student/courses/${subject.id}`}
                                  className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                                >
                                  Access Course
                                </Link>
                              ) : (
                                <button disabled className="w-full py-2.5 px-4 rounded-xl font-medium text-muted-foreground bg-muted cursor-not-allowed">
                                  Locked
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
