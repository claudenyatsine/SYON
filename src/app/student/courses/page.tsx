import { getSubjects, getMyEnrollments } from '@/app/actions/lms'
import { EnrollButton } from './EnrollButton'
import Link from 'next/link'
import { BookOpen, GraduationCap, Clock, CheckCircle, ArrowLeft, Landmark, Award } from 'lucide-react'
import { CurriculumBoardBadge, SubjectLevelBadge } from '@/components/app/subject-badge'
import { getCurriculumBoard, getSubjectLevel, getSubjectBaseName, getSubjectCode } from '@/utils/subject-utils'

interface SubjectItem {
  id: string
  name: string
  category?: string
  level?: string
  curriculum_board?: string
  description?: string
}

type GroupedSubjects = Record<string, Record<string, Record<string, SubjectItem[]>>>

export default async function CoursesPage() {
  const [{ data: subjects }, { data: enrollments }] = await Promise.all([
    getSubjects(),
    getMyEnrollments()
  ])

  // Group subjects by Curriculum Board -> Level -> Category
  const grouped: GroupedSubjects = (subjects as SubjectItem[] | undefined)?.reduce((acc: GroupedSubjects, subject: SubjectItem) => {
    const board = getCurriculumBoard(subject);
    const level = getSubjectLevel(subject);
    const category = subject.category || 'General';

    if (!acc[board]) acc[board] = {};
    if (!acc[board][level]) acc[board][level] = {};
    if (!acc[board][level][category]) acc[board][level][category] = [];
    acc[board][level][category].push(subject);
    return acc;
  }, {}) || {};

  const boards = ['ZIMSEC', 'Cambridge'];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-4">
          <Link href="/student/study-panel" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Study Panel
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Curriculum & Course Catalog
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl">
              Explore official <strong className="text-gold">ZIMSEC</strong> and <strong className="text-sky-400">Cambridge CIE</strong> accredited curricula across ZJC, O-Level, and A-Level.
            </p>
          </div>
        </header>

        <div className="space-y-16">
          {boards.map(board => {
            const levels = grouped[board];
            if (!levels || Object.keys(levels).length === 0) return null;

            const isCambridge = board === 'Cambridge';

            return (
              <section key={board} className="space-y-10 rounded-3xl border border-border/80 bg-card/40 p-6 md:p-8 backdrop-blur-sm shadow-sm">
                {/* Board Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                      isCambridge 
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                        : 'bg-gold/10 border-gold/30 text-gold'
                    }`}>
                      {isCambridge ? <Award className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        {isCambridge ? 'Cambridge Assessment International (CIE)' : 'ZIMSEC National Curriculum'}
                      </h2>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {isCambridge 
                          ? 'International IGCSE and GCE A-Level Syllabus standards.' 
                          : 'Zimbabwe School Examinations Council ZJC, O-Level, and A-Level standards.'}
                      </p>
                    </div>
                  </div>
                  <CurriculumBoardBadge board={board} size="lg" />
                </div>

                {/* Academic Levels in this Board */}
                <div className="space-y-12">
                  {Object.entries(levels as Record<string, Record<string, SubjectItem[]>>).map(([level, categories]) => (
                    <div key={level} className="space-y-6">
                      <div className="flex items-center gap-2.5">
                        <SubjectLevelBadge level={level} size="default" />
                        <h3 className="text-lg font-bold text-foreground">{level} Qualifications</h3>
                      </div>

                      {/* Categories */}
                      <div className="space-y-8 pl-1 md:pl-3 border-l-2 border-border/60">
                        {Object.entries(categories as Record<string, SubjectItem[]>).map(([category, subs]) => (
                          <div key={category} className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                              <BookOpen className="w-4 h-4 text-gold" />
                              <span>{category}</span>
                              <span className="text-[11px] text-muted-foreground/60">({subs.length} subjects)</span>
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {subs.map((subject: SubjectItem) => {
                                const enrollment = enrollments?.find((e: any) => e.subject_id === subject.id)
                                
                                return (
                                  <div 
                                    key={subject.id} 
                                    className="group relative bg-card border border-border rounded-2xl p-5 transition-all duration-300 hover:border-gold/50 hover:shadow-lg flex flex-col justify-between"
                                  >
                                    <div className="space-y-3">
                                      {/* Top Badges */}
                                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                        <CurriculumBoardBadge board={board} size="sm" />
                                        <SubjectLevelBadge level={level} size="sm" />
                                      </div>

                                      <div className="space-y-1">
                                        <h5 className="text-base font-bold text-foreground group-hover:text-gold transition-colors">
                                          {subject.name}
                                        </h5>
                                        <p className="text-xs text-muted-foreground">
                                          {category} • {board}
                                        </p>
                                      </div>
                                      
                                      {enrollment ? (
                                        <div className="pt-1">
                                          {enrollment.status === 'pending' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                              <Clock className="w-3.5 h-3.5" />
                                              Awaiting Approval
                                            </span>
                                          ) : enrollment.status === 'approved' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                              <CheckCircle className="w-3.5 h-3.5" />
                                              Enrolled & Approved
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                                              Rejected
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-muted-foreground pt-1">Not enrolled</p>
                                      )}
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-border/50">
                                      {!enrollment ? (
                                        <EnrollButton subjectId={subject.id} />
                                      ) : enrollment.status === 'approved' ? (
                                        <Link 
                                          href={`/student/study-panel/${subject.id}`}
                                          className="flex items-center justify-center w-full py-2 px-4 rounded-xl text-xs font-bold text-black bg-gold hover:bg-[#c29f2f] transition-colors shadow-sm"
                                        >
                                          Open 1-on-1 Hub →
                                        </Link>
                                      ) : (
                                        <button disabled className="w-full py-2 px-4 rounded-xl text-xs font-medium text-muted-foreground bg-muted cursor-not-allowed">
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
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  )
}
