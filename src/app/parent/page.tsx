import { SchoolHeader } from "@/components/app/school-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, CalendarCheck, Medal } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ParentPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Find linked students
    const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', user.id);

    const studentIds = links?.map(l => l.student_id) || [];

    if (studentIds.length === 0) {
        return (
            <div className="p-4 sm:p-6 space-y-6">
                <SchoolHeader />
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
                    <p className="text-muted-foreground">Your central hub for monitoring your child's learning journey.</p>
                </div>
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No students have been linked to your account yet. Please contact an administrator.
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Fetch the students' profiles
    const { data: studentsData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);

    const students = studentsData || [];

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
                <p className="text-muted-foreground">Your central hub for monitoring your child's learning journey.</p>
            </div>

            {students.map((student) => (
                <StudentDashboard key={student.id} student={student} />
            ))}
        </div>
    );
}

async function StudentDashboard({ student }: { student: any }) {
    const supabase = await createClient();

    // Fetch courses
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', student.id);
        
    const courseIds = enrollments?.map(e => e.course_id) || [];
    
    let courses: any[] = [];
    if (courseIds.length > 0) {
        const { data: cData } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds);
        courses = cData || [];
    }

    // Mock KPIs based on real courses because actual KPI tables are pending
    const courseProgress = courses.map((c) => ({
        name: c.title,
        progress: Math.floor(Math.random() * 30) + 70, // 70-99%
        grade: "A-", // Mocked grade
    }));
    
    const overallScore = Math.floor(Math.random() * 15) + 80;
    const attendance = Math.floor(Math.random() * 10) + 90;

    const recentAchievements = [
        { title: "Top Performer in " + (courses[0]?.title || "Calculus Quiz"), date: "2 days ago", icon: Award },
        { title: "Perfect Attendance for the month", date: "Last week", icon: CalendarCheck },
        { title: "Submitted Science Fair project early", date: "Last week", icon: Medal },
    ];

    const initials = (student.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase();

    return (
        <div className="space-y-6 pb-8">
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border">
                        <AvatarImage src={student.avatar_url} alt={student.full_name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center sm:text-left">
                        <h2 className="text-2xl font-bold">{student.full_name}</h2>
                        <p className="text-muted-foreground">Grade 11</p>
                    </div>
                    <div className="flex gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold text-primary">{overallScore}%</p>
                            <p className="text-sm text-muted-foreground">Overall Score</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary">{attendance}%</p>
                            <p className="text-sm text-muted-foreground">Attendance</p>
                        </div>
                         <div>
                            <p className="text-3xl font-bold text-primary">{courses.length}</p>
                            <p className="text-sm text-muted-foreground">Courses</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Progress</CardTitle>
                        <CardDescription>An overview of {student.full_name}'s progress in their courses.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {courseProgress.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Not enrolled in any courses yet.</p>
                        ) : (
                            courseProgress.map(course => (
                                <div key={course.name}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium">{course.name}</span>
                                        <span className="text-sm text-muted-foreground">{course.grade} ({course.progress}%)</span>
                                    </div>
                                    <Progress value={course.progress} />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Achievements</CardTitle>
                        <CardDescription>Celebrate {student.full_name}'s recent milestones!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {recentAchievements.map((achievement, index) => {
                                const Icon = achievement.icon;
                                return (
                                <li key={index} className="flex items-center gap-4">
                                     <div className="bg-gold p-2 rounded-full">
                                        <Icon className="h-5 w-5 text-gold" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{achievement.title}</p>
                                        <p className="text-sm text-muted-foreground">{achievement.date}</p>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
