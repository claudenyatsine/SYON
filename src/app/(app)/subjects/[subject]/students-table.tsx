
'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import images from '@/lib/placeholder-images.json';

const students = [
  { name: 'Alex Doe', avatar: images.avatar1.src, grade: 'A-', attendance: 98, progress: 92, lastLogin: '2 hours ago' },
  { name: 'Bethany Smith', avatar: images.avatar2.src, grade: 'B+', attendance: 95, progress: 85, lastLogin: '1 day ago' },
  { name: 'Charlie Brown', avatar: images.avatar3.src, grade: 'C', attendance: 85, progress: 70, lastLogin: '3 days ago' },
  { name: 'Diana Prince', avatar: images.avatar4.src, grade: 'A', attendance: 100, progress: 95, lastLogin: '5 hours ago' },
  { name: 'Ethan Hunt', avatar: images.avatar5.src, grade: 'B', attendance: 92, progress: 80, lastLogin: 'yesterday' },
]

export function StudentsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Attendance</TableHead>
          <TableHead className="w-[150px]">Course Progress</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.name}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{student.name}</span>
              </div>
            </TableCell>
            <TableCell>
                <Badge variant={student.grade.startsWith('A') ? 'default' : student.grade.startsWith('B') ? 'secondary' : 'outline'}>{student.grade}</Badge>
            </TableCell>
            <TableCell>{student.attendance}%</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Progress value={student.progress} className="h-2"/>
                    <span className="text-xs text-muted-foreground">{student.progress}%</span>
                </div>
            </TableCell>
            <TableCell>{student.lastLogin}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>View Progress Report</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Student
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

    
