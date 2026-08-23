import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import * as React from "react";
import { SchoolHeader } from "@/components/app/school-header";

const tutors = [
    {
        name: "Dr. Evelyn Reed",
        email: "e.reed@drmax.online",
        avatarUrl: "https://picsum.photos/seed/102/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 4,
        totalStudents: 120,
        status: "Active"
    },
    {
        name: "Prof. Alistair Finch",
        email: "a.finch@drmax.online",
        avatarUrl: "https://picsum.photos/seed/105/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 2,
        totalStudents: 85,
        status: "Active"
    },
    {
        name: "Ms. Helena Garcia",
        email: "h.garcia@drmax.online",
        avatarUrl: "https://picsum.photos/seed/106/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 3,
        totalStudents: 105,
        status: "Inactive"
    },
    {
        name: "Dr. Kenji Tanaka",
        email: "k.tanaka@drmax.online",
        avatarUrl: "https://picsum.photos/seed/107/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 5,
        totalStudents: 150,
        status: "Active"
    },
    {
        name: "Mrs. Sofia Rossi",
        email: "s.rossi@drmax.online",
        avatarUrl: "https://picsum.photos/seed/108/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 3,
        totalStudents: 90,
        status: "Active"
    },
    {
        name: "Mr. David Chen",
        email: "d.chen@drmax.online",
        avatarUrl: "https://picsum.photos/seed/109/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 4,
        totalStudents: 110,
        status: "Active"
    },
    {
        name: "Dr. Isabella Vance",
        email: "i.vance@drmax.online",
        avatarUrl: "https://picsum.photos/seed/110/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 1,
        totalStudents: 30,
        status: "Inactive"
    },
    {
        name: "Prof. Omar Badawi",
        email: "o.badawi@drmax.online",
        avatarUrl: "https://picsum.photos/seed/111/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 3,
        totalStudents: 95,
        status: "Active"
    },
    {
        name: "Ms. Chloe Dubois",
        email: "c.dubois@drmax.online",
        avatarUrl: "https://picsum.photos/seed/112/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 2,
        totalStudents: 60,
        status: "Active"
    },
    {
        name: "Dr. Arthur Pendelton",
        email: "a.pendelton@drmax.online",
        avatarUrl: "https://picsum.photos/seed/113/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 4,
        totalStudents: 130,
        status: "Active"
    },
    {
        name: "Prof. Nina Simone",
        email: "n.simone@drmax.online",
        avatarUrl: "https://picsum.photos/seed/114/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 2,
        totalStudents: 70,
        status: "Active"
    },
    {
        name: "Mr. Leo Maxwell",
        email: "l.maxwell@drmax.online",
        avatarUrl: "https://picsum.photos/seed/115/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 3,
        totalStudents: 100,
        status: "Active"
    }
]

function TutorList() {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>All Tutors</CardTitle>
                        <CardDescription>A list of all tutors registered at your institution.</CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search tutors..." className="pl-9" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tutor</TableHead>
                            <TableHead>Courses Assigned</TableHead>
                            <TableHead>Total Students</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tutors.map((tutor) => (
                            <TableRow key={tutor.email}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={tutor.avatarUrl} alt={tutor.name} data-ai-hint={tutor.avatarHint} />
                                            <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{tutor.name}</div>
                                            <div className="text-sm text-muted-foreground">{tutor.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{tutor.coursesAssigned}</TableCell>
                                <TableCell>{tutor.totalStudents}</TableCell>
                                <TableCell>
                                    <Badge variant={tutor.status === 'Active' ? 'default' : 'secondary'} className={tutor.status === 'Active' ? 'bg-gold/10 text-gold' : ''}>{tutor.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline">View</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


export default function TutorsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tutor Management</h1>
                <p className="text-muted-foreground">View, search, and manage all tutors in your school.</p>
            </div>
            <TutorList />
        </div>
    );
}
