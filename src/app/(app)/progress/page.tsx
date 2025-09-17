
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUp, BookCheck, Clock, Target, Award, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import images from '@/lib/placeholder-images.json';

const overallProgressData = [
  { month: 'Jan', progress: 20 },
  { month: 'Feb', progress: 35 },
  { month: 'Mar', progress: 45 },
  { month: 'Apr', progress: 60 },
  { month: 'May', progress: 70 },
  { month: 'Jun', progress: 85 },
];

const subjectPerformanceData = [
  { subject: 'Math', score: 92 },
  { subject: 'Physics', score: 85 },
  { subject: 'History', score: 78 },
  { subject: 'English', score: 88 },
  { subject: 'Chemistry', score: 95 },
];

const topStudents = {
    topPerformer: { name: 'Diana Prince', avatar: images.avatar1.src, grade: 'A', subject: 'Overall' },
    risingStar: { name: 'Charlie Brown', avatar: images.avatar2.src, improvement: '+15%', subject: 'Physics' },
}

const recentAchievements = [
    { student: 'Alex Doe', avatar: images.avatar3.src, action: 'completed', task: 'Algebra Assignment', score: '98%', time: '2m ago' },
    { student: 'Bethany Smith', avatar: images.avatar4.src, action: 'scored 100% on', task: 'History Pop Quiz', score: '100%', time: '15m ago' },
    { student: 'Diana Prince', avatar: images.avatar1.src, action: 'achieved a new high score in', task: 'Physics Simulation', score: '95%', time: '1h ago' },
    { student: 'Ethan Hunt', avatar: images.avatar5.src, action: 'completed', task: 'English Essay', score: '88%', time: '3h ago' },
     { student: 'Charlie Brown', avatar: images.avatar2.src, action: 'improved their grade in', task: 'Calculus', score: 'to B-', time: '5h ago' },
]

export default function ProgressPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground">An overview of class performance and student achievements.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <BookCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">Maintained from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48 hours</div>
            <p className="text-xs text-muted-foreground">Average per student</p>
          </CardContent>
        </Card>
         <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Most Improved Subject</CardTitle>
            <ArrowUp className="h-5 w-5 text-primary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Physics (+15%)</div>
            <p className="text-xs text-primary-foreground/80">Class average increase</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
         <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Overall Progress</CardTitle>
                    <CardDescription>Class-wide learning completion percentage over time.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={overallProgressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis unit="%" />
                            <Tooltip
                            contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)"
                            }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="progress" name="Avg. Progress" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Subject Performance</CardTitle>
                    <CardDescription>Average scores across different subjects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={subjectPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="subject" />
                            <YAxis unit="%" />
                            <Tooltip
                            contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)"
                            }}
                            />
                            <Legend />
                            <Bar dataKey="score" name="Avg. Score" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Student Spotlight</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                        <Award className="h-8 w-8 text-yellow-500"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Top Performer</p>
                            <p className="font-semibold">{topStudents.topPerformer.name}</p>
                            <p className="text-xs text-muted-foreground">{topStudents.topPerformer.grade} Grade ({topStudents.topPerformer.subject})</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 rounded-lg border p-4">
                        <TrendingUp className="h-8 w-8 text-green-500"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Rising Star</p>
                            <p className="font-semibold">{topStudents.risingStar.name}</p>
                            <p className="text-xs text-muted-foreground">{topStudents.risingStar.improvement} in {topStudents.risingStar.subject}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Achievements</CardTitle>
                    <CardDescription>Latest student accomplishments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        <div className="space-y-4">
                            {recentAchievements.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={item.avatar} alt={item.student} />
                                        <AvatarFallback>{item.student.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                        <p>
                                            <span className="font-semibold">{item.student}</span> {item.action} <span className="font-medium text-primary">{item.task}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">{item.time}</p>
                                    </div>
                                    <Badge variant="secondary" className="ml-auto">{item.score}</Badge>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
          </div>
       </div>
    </div>
  );
}
